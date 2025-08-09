from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from config import Config
from routes.incidents import bp as incidents_bp
from routes.stats import bp as stats_bp
from routes.alerts import bp as alerts_bp

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

app.register_blueprint(incidents_bp)
app.register_blueprint(stats_bp)
app.register_blueprint(alerts_bp)

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000)