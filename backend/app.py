from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from config import Config
from utils.db import Base, engine
from routes.incidents import bp as incidents_bp
from routes.ingest import bp as ingest_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)

    # ensure tables exist (alembic will manage migrations after first create)
    Base.metadata.create_all(bind=engine)

    @app.route("/")
    def index():
        return "Inci-Alert API is running."

    app.register_blueprint(incidents_bp)
    app.register_blueprint(ingest_bp)
    return app

app = create_app()
socketio = SocketIO(app, cors_allowed_origins="*")

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000)
