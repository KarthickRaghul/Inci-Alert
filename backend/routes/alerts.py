from flask import Blueprint
from flask_socketio import emit
from app import socketio

bp = Blueprint("alerts", __name__, url_prefix="/alerts")

@socketio.on("connect")
def handle_connect():
    emit("message", {"msg": "Connected to real-time alerts"})