from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from flask_jwt_extended import JWTManager
from config import Config
from utils.db import Base, engine
from routes.incidents import bp as incidents_bp
from routes.ingest import bp as ingest_bp
from routes.media import bp as media_bp
from routes.auth import bp as auth_bp, check_if_token_revoked
from routes.stats import bp as stats_bp
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Ensure upload directory exists
    upload_folder = app.config.get('UPLOAD_FOLDER', 'uploads')
    os.makedirs(upload_folder, exist_ok=True)
    
    # Initialize CORS
    CORS(app, 
         origins=["http://localhost:8080", "http://localhost:8081"], 
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    
    # Initialize JWT
    jwt = JWTManager(app)
    jwt.token_in_blocklist_loader(check_if_token_revoked)

    # ensure tables exist (alembic will manage migrations after first create)
    Base.metadata.create_all(bind=engine)

    @app.route("/")
    def index():
        return {"message": "Inci-Alert API is running", "status": "ok"}

    @app.route("/health")
    def health():
        return {"status": "healthy"}

    app.register_blueprint(incidents_bp)
    app.register_blueprint(ingest_bp)
    app.register_blueprint(media_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(stats_bp)
    return app

app = create_app()

# Configure Socket.IO with proper settings
socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    async_mode='threading',
    logger=False,
    engineio_logger=False
)

# Socket.IO event handlers
@socketio.on('connect')
def handle_connect():
    print('Client connected')
    emit('status', {'message': 'Connected to Inci-Alert WebSocket'})

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('ping')
def handle_ping():
    emit('pong', {'timestamp': 'pong'})

# Function to emit incident updates
def emit_incident_update(incident_data):
    socketio.emit('incident_update', incident_data)

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=False)
