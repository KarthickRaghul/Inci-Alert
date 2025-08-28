import hashlib, jwt, datetime
SECRET = "change-this"

def hash_password(pw):
    return hashlib.sha256(pw.encode()).hexdigest()

def check_password(hash, pw):
    return hash == hashlib.sha256(pw.encode()).hexdigest()

def create_token(user_id):
    payload = {"id": user_id, "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)}
    return jwt.encode(payload, SECRET, algorithm="HS256")

def decode_token(token):
    try:
        return jwt.decode(token, SECRET, algorithms=["HS256"])
    except Exception:
        return None
