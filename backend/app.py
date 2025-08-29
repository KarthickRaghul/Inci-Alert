from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from config import Config
from utils.db import Base, engine
from routes.incidents import bp as incidents_bp
from routes.ingest import bp as ingest_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize CORS
    CORS(app, origins="*", allow_headers="*", methods="*")

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
