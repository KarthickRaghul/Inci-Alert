from flask import Blueprint, request, jsonify
from models.user import User
from utils.db import SessionLocal
from utils.security import hash_password, check_password, create_token

bp = Blueprint("auth", __name__, url_prefix="/auth")

@bp.route("/register", methods=["POST"])
def register():
    data = request.json
    username, password = data["username"], data["password"]
    session = SessionLocal()
    if session.query(User).filter_by(username=username).first():
        return jsonify({"error": "Exists"}), 400
    u = User(username=username, password_hash=hash_password(password))
    session.add(u)
    session.commit()
    session.close()
    return jsonify({"message": "Registered"})

@bp.route("/login", methods=["POST"])
def login():
    data = request.json
    username, password = data["username"], data["password"]
    session = SessionLocal()
    u = session.query(User).filter_by(username=username).first()
    if not u or not check_password(u.password_hash, password):
        return jsonify({"error": "Invalid"}), 401
    token = create_token(u.id)
    return jsonify({"token": token})
