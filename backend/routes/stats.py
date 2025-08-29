from flask import Blueprint, request, jsonify, current_app
from sqlalchemy import func, text, and_, or_
from sqlalchemy.exc import SQLAlchemyError
from utils.db import SessionLocal
from models.incident import Incident
from datetime import datetime, timedelta
import traceback

bp = Blueprint("stats", __name__, url_prefix="/stats")

@bp.get("/overview")
def get_overview_stats():
    """Get overview statistics for incidents."""
    session = SessionLocal()
    
    try:
        # Basic counts
        total_incidents = session.query(func.count(Incident.id)).scalar()
        
        # Status breakdown
        status_stats = session.query(
            Incident.status,
            func.count(Incident.id).label('count')
        ).group_by(Incident.status).all()
        
        # Category breakdown
        category_stats = session.query(
            Incident.category,
            func.count(Incident.id).label('count')
        ).group_by(Incident.category).all()
        
        # Recent incidents (last 24 hours)
        twenty_four_hours_ago = datetime.utcnow() - timedelta(hours=24)
        recent_incidents = session.query(func.count(Incident.id)).filter(
            Incident.created_at >= twenty_four_hours_ago
        ).scalar()
        
        # Weekly trend (last 7 days)
        weekly_stats = []
        for i in range(7):
            day_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=i)
            day_end = day_start + timedelta(days=1)
            
            daily_count = session.query(func.count(Incident.id)).filter(
                and_(Incident.created_at >= day_start, Incident.created_at < day_end)
            ).scalar()
            
            weekly_stats.append({
                "date": day_start.strftime("%Y-%m-%d"),
                "count": daily_count
            })
        
        return jsonify({
            "total_incidents": total_incidents,
            "recent_incidents_24h": recent_incidents,
            "status_breakdown": [{"status": s[0], "count": s[1]} for s in status_stats],
            "category_breakdown": [{"category": c[0], "count": c[1]} for c in category_stats],
            "weekly_trend": list(reversed(weekly_stats))
        })
        
    except SQLAlchemyError as e:
        current_app.logger.error(f"Database error in get_overview_stats: {str(e)}")
        return jsonify({"error": "Database error"}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error in get_overview_stats: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        session.close()

@bp.get("/category")
def get_category_stats():
    """Get detailed category statistics."""
    session = SessionLocal()
    
    try:
        # Get time filter
        days = request.args.get('days', 30, type=int)
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Category stats with time filter
        category_stats = session.query(
            Incident.category,
            func.count(Incident.id).label('total_count'),
            func.count(Incident.id).filter(Incident.status == 'resolved').label('resolved_count'),
            func.count(Incident.id).filter(Incident.status == 'reported').label('open_count')
        ).filter(
            Incident.created_at >= start_date
        ).group_by(Incident.category).all()
        
        result = []
        for stat in category_stats:
            result.append({
                "category": stat[0],
                "total_count": stat[1],
                "resolved_count": stat[2],
                "open_count": stat[3],
                "resolution_rate": (stat[2] / stat[1] * 100) if stat[1] > 0 else 0
            })
        
        return jsonify({
            "period_days": days,
            "categories": result
        })
        
    except SQLAlchemyError as e:
        current_app.logger.error(f"Database error in get_category_stats: {str(e)}")
        return jsonify({"error": "Database error"}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error in get_category_stats: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        session.close()

@bp.get("/location")
def get_location_stats():
    """Get location-based statistics."""
    session = SessionLocal()
    
    try:
        # Get incidents with location data
        location_stats = session.query(
            Incident.location,
            func.count(Incident.id).label('count'),
            func.avg(Incident.latitude).label('avg_lat'),
            func.avg(Incident.longitude).label('avg_lng')
        ).filter(
            and_(Incident.location.isnot(None), Incident.location != '')
        ).group_by(Incident.location).order_by(text('count DESC')).limit(20).all()
        
        result = []
        for stat in location_stats:
            result.append({
                "location": stat[0],
                "count": stat[1],
                "avg_latitude": float(stat[2]) if stat[2] else None,
                "avg_longitude": float(stat[3]) if stat[3] else None
            })
        
        return jsonify({"locations": result})
        
    except SQLAlchemyError as e:
        current_app.logger.error(f"Database error in get_location_stats: {str(e)}")
        return jsonify({"error": "Database error"}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error in get_location_stats: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        session.close()

@bp.get("/timeline")
def get_timeline_stats():
    """Get timeline statistics for incidents."""
    session = SessionLocal()
    
    try:
        # Get parameters
        period = request.args.get('period', 'week')  # week, month, year
        category = request.args.get('category')
        
        # Determine date grouping
        if period == 'week':
            date_format = '%Y-%m-%d'
            days_back = 7
        elif period == 'month':
            date_format = '%Y-%m-%d'
            days_back = 30
        elif period == 'year':
            date_format = '%Y-%m'
            days_back = 365
        else:
            return jsonify({"error": "Invalid period. Use 'week', 'month', or 'year'"}), 400
        
        start_date = datetime.utcnow() - timedelta(days=days_back)
        
        # Build query
        query = session.query(
            func.date_trunc('day', Incident.created_at).label('date'),
            func.count(Incident.id).label('count')
        ).filter(Incident.created_at >= start_date)
        
        if category:
            query = query.filter(Incident.category == category)
        
        timeline_data = query.group_by(text('date')).order_by(text('date')).all()
        
        result = []
        for data_point in timeline_data:
            result.append({
                "date": data_point[0].strftime(date_format),
                "count": data_point[1]
            })
        
        return jsonify({
            "period": period,
            "category": category,
            "timeline": result
        })
        
    except SQLAlchemyError as e:
        current_app.logger.error(f"Database error in get_timeline_stats: {str(e)}")
        return jsonify({"error": "Database error"}), 500
    except Exception as e:
        current_app.logger.error(f"Unexpected error in get_timeline_stats: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    finally:
        session.close()
