from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity, get_jwt
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from marshmallow import ValidationError
from utils.db import SessionLocal
from models.user import User
from utils.validation import UserRegistrationSchema, UserLoginSchema, validate_request_data
from datetime import datetime, timedelta
import traceback

bp = Blueprint("auth", __name__, url_prefix="/auth")

# JWT blacklist (in production, use Redis or database)
blacklisted_tokens = set()

@bp.post("/register")
def register():
    """Register a new user."""
    session = SessionLocal()
    
    try:
        data = request.get_json() or {}
        
        # Validate data
        try:
            validated_data = validate_request_data(UserRegistrationSchema, data)
        except ValidationError as e:
            return jsonify({"error": "Validation failed", "details": e.messages}), 400
        
        # Check if user already exists
        existing_user = session.query(User).filter(
            (User.username == validated_data['username']) | 
            (User.email == validated_data['email'])
        ).first()
        
        if existing_user:
            return jsonify({"error": "User already exists with this username or email"}), 409
        
        # Create new user
        user = User(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name'),
            last_name=validated_data.get('last_name'),
            phone=validated_data.get('phone')
        )
        user.set_password(validated_data['password'])
        
        session.add(user)
        session.commit()
        
        # Create access token
        access_token = create_access_token(
            identity=user.id,
            additional_claims={"role": user.role, "username": user.username}
        )
        
        current_app.logger.info(f"New user registered: {user.username}")
        
        return jsonify({
            "message": "User registered successfully",
            "user": user.to_dict(),
            "access_token": access_token
        }), 201
        
    except IntegrityError:
        session.rollback()
        return jsonify({"error": "User already exists"}), 409
    except SQLAlchemyError as e:
        session.rollback()
        current_app.logger.error(f"Database error in register: {str(e)}")
        return jsonify({"error": "Database error"}), 500
    except Exception as e:
        session.rollback()
        current_app.logger.error(f"Unexpected error in register: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        session.close()

@bp.post("/login")
def login():
    """Login user."""
    session = SessionLocal()
    
    try:
        data = request.get_json() or {}
        
        # Validate data
        try:
            validated_data = validate_request_data(UserLoginSchema, data)
        except ValidationError as e:
            return jsonify({"error": "Validation failed", "details": e.messages}), 400
        
        # Find user
        user = session.query(User).filter(
            (User.username == validated_data['username']) | 
            (User.email == validated_data['username'])
        ).first()
        
        if not user or not user.check_password(validated_data['password']):
            return jsonify({"error": "Invalid credentials"}), 401
        
        if not user.is_active:
            return jsonify({"error": "Account is deactivated"}), 401
        
        # Update last login
        user.last_login = datetime.utcnow()
        session.commit()
        
        # Create access token
        access_token = create_access_token(
            identity=user.id,
            additional_claims={"role": user.role, "username": user.username}
        )
        
        return jsonify({
            "message": "Login successful",
            "user": user.to_dict(),
            "access_token": access_token
        })
        
    except SQLAlchemyError as e:
        session.rollback()
        current_app.logger.error(f"Database error in login: {str(e)}")
        return jsonify({"error": "Database error"}), 500
    except Exception as e:
        session.rollback()
        current_app.logger.error(f"Unexpected error in login: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        session.close()

@bp.post("/logout")
@jwt_required()
def logout():
    """Logout user by blacklisting token."""
    try:
        jti = get_jwt()['jti']  # JWT ID
        blacklisted_tokens.add(jti)
        
        return jsonify({"message": "Successfully logged out"}), 200
        
    except Exception as e:
        current_app.logger.error(f"Error in logout: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@bp.get("/profile")
@jwt_required()
def get_profile():
    """Get current user profile."""
    session = SessionLocal()
    
    try:
        user_id = get_jwt_identity()
        user = session.get(User, user_id)
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify({"user": user.to_dict()})
        
    except SQLAlchemyError as e:
        current_app.logger.error(f"Database error in get_profile: {str(e)}")
        return jsonify({"error": "Database error"}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error in get_profile: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        session.close()

@bp.put("/profile")
@jwt_required()
def update_profile():
    """Update user profile."""
    session = SessionLocal()
    
    try:
        user_id = get_jwt_identity()
        user = session.get(User, user_id)
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        data = request.get_json() or {}
        
        # Update allowed fields
        allowed_fields = ['first_name', 'last_name', 'phone']
        for field in allowed_fields:
            if field in data:
                setattr(user, field, data[field])
        
        session.commit()
        
        return jsonify({
            "message": "Profile updated successfully",
            "user": user.to_dict()
        })
        
    except SQLAlchemyError as e:
        session.rollback()
        current_app.logger.error(f"Database error in update_profile: {str(e)}")
        return jsonify({"error": "Database error"}), 500
    except Exception as e:
        session.rollback()
        current_app.logger.error(f"Unexpected error in update_profile: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        session.close()

# JWT token blacklist checker
def check_if_token_revoked(jwt_header, jwt_payload):
    jti = jwt_payload['jti']
    return jti in blacklisted_tokens
