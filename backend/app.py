# -------------------- Imports --------------------
import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO
from config import Config
from utils.db import Base, engine

# ----------- Blueprints / Routes Imports ----------
from routes.incidents import bp as incidents_bp
from routes.ingest import bp as ingest_bp
from routes.media import bp as media_bp

# ------------------ App Factory ------------------
def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    CORS(app)

    # Ensure tables exist (Alembic will manage migrations after first create)
    Base.metadata.create_all(bind=engine)

    # Root route
    @app.route("/")
    def index():
        return "Inci-Alert API is running."

    # Register blueprints
    app.register_blueprint(incidents_bp)
    app.register_blueprint(media_bp)
    app.register_blueprint(ingest_bp)
    return app

# ------------------- SocketIO --------------------
app = create_app()
socketio = SocketIO(app, cors_allowed_origins="*")

# ------------- File Upload Serving ---------------
UPLOAD_FOLDER = os.path.abspath("uploads")
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Serve files from the uploads directory
@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


# ------------------- Main ------------------------
if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000)