import os
import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from model import chat_response

# Serve static files from the frontend folder
app = Flask(__name__, static_folder='../frontend', static_url_path='')
CORS(app)

# --- Configuration ---
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'diet_app.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'super-secret-key-change-this-in-prod'

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Serve Frontend at Root
@app.route("/")
def serve_frontend():
    return send_from_directory(app.static_folder, 'index.html')

# --- Models ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    profile = db.relationship('Profile', backref='user', uselist=False)
    history = db.relationship('ChatHistory', backref='user', lazy=True)

class Profile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True, nullable=False)
    name = db.Column(db.String(100))
    age = db.Column(db.Integer)
    height = db.Column(db.Float)
    weight = db.Column(db.Float)
    gender = db.Column(db.String(20)) # New
    activity_level = db.Column(db.String(50)) 
    food_preference = db.Column(db.String(50))
    allergies = db.Column(db.String(200)) # New
    medical_conditions = db.Column(db.String(200)) # New
    meals_per_day = db.Column(db.Integer)
    goal = db.Column(db.String(50))

class ChatHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    reply = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.datetime.utcnow)

# --- Routes ---

# 1. Auth: Register
@app.route('/auth/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if User.query.filter_by(username=username).first():
        return jsonify({"msg": "Username already exists"}), 400

    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, password_hash=hashed_pw)
    db.session.add(new_user)
    db.session.commit()

    # Create empty profile
    new_profile = Profile(user_id=new_user.id)
    db.session.add(new_profile)
    db.session.commit()

    return jsonify({"msg": "User registered successfully"}), 201

# 2. Auth: Login
@app.route('/auth/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()
    if user and bcrypt.check_password_hash(user.password_hash, password):
        access_token = create_access_token(identity=str(user.id))
        return jsonify(access_token=access_token), 200
    
    return jsonify({"msg": "Invalid credentials"}), 401

# 3. Profile: Get & Update
@app.route('/profile', methods=['GET', 'PUT'])
@jwt_required()
def manage_profile():
    current_user_id = get_jwt_identity()
    profile = Profile.query.filter_by(user_id=current_user_id).first()

    if request.method == 'GET':
        if not profile:
            return jsonify({}), 200
        return jsonify({
            "name": profile.name,
            "age": profile.age,
            "height": profile.height,
            "weight": profile.weight,
            "gender": profile.gender,
            "activity_level": profile.activity_level,
            "food_preference": profile.food_preference,
            "allergies": profile.allergies,
            "medical_conditions": profile.medical_conditions,
            "meals_per_day": profile.meals_per_day,
            "goal": profile.goal
        }), 200
    
    if request.method == 'PUT':
        data = request.json
        profile.name = data.get('name', profile.name)
        profile.age = data.get('age', profile.age)
        profile.height = data.get('height', profile.height)
        profile.weight = data.get('weight', profile.weight)
        profile.gender = data.get('gender', profile.gender)
        profile.activity_level = data.get('activity_level', profile.activity_level)
        profile.food_preference = data.get('food_preference', profile.food_preference)
        profile.allergies = data.get('allergies', profile.allergies)
        profile.medical_conditions = data.get('medical_conditions', profile.medical_conditions)
        profile.meals_per_day = data.get('meals_per_day', profile.meals_per_day)
        profile.goal = data.get('goal', profile.goal)
        
        db.session.commit()
        return jsonify({"msg": "Profile updated"}), 200

# 4. Chat: Post Message
@app.route('/chat', methods=['POST'])
@jwt_required()
def chat():
    current_user_id = get_jwt_identity()
    user_message = request.json.get("message")


    
    # Format history for the model function: ["User: msg", "Model: reply", ...]
    # But model.py expects list of strings, presumably alternating?
    # Checking model.py: "for msg in history: messages.append(HumanMessage(content=msg))"
    try:
        # Fetch previous history for context
        # Limit to last 10 messages to keep context short? Or just send all
        # For now, let's grab last 10
        recent_history_objs = ChatHistory.query.filter_by(user_id=current_user_id).order_by(ChatHistory.timestamp.asc()).all()
        
        history_list = []
        for h in recent_history_objs:
            history_list.append(h.message)
            history_list.append(h.reply)
            
        # Fetch Profile Context
        profile = Profile.query.filter_by(user_id=current_user_id).first()
        profile_str = ""
        if profile:
            profile_str = (
                f"Name: {profile.name or 'Unknown'}, "
                f"Age: {profile.age or 'Unknown'}, "
                f"Gender: {profile.gender or 'Unknown'}, "
                f"Height: {profile.height or 'Unknown'}cm, "
                f"Weight: {profile.weight or 'Unknown'}kg, "
                f"Activity: {profile.activity_level or 'Unknown'}, "
                f"Food: {profile.food_preference or 'Unknown'}, "
                f"Allergies: {profile.allergies or 'None'}, "
                f"Medical Conditions: {profile.medical_conditions or 'None'}, "
                f"Meals/Day: {profile.meals_per_day or 'Unknown'}, "
                f"Goal: {profile.goal or 'Unknown'}"
            )
        print(f"DEBUG: Sending to Model: {profile_str}")

        reply = chat_response(history_list, user_message, profile_str=profile_str)
        
        # Save to DB
        new_chat = ChatHistory(user_id=current_user_id, message=user_message, reply=reply)
        db.session.add(new_chat)
        db.session.commit()

        return jsonify({"reply": reply})
    except Exception as e:
        print(f"Error in chat endpoint: {e}")
        return jsonify({"reply": f"Error: {str(e)}"}), 500

# 5. History: Get & Delete
@app.route('/history', methods=['GET', 'DELETE'])
@jwt_required()
def history():
    current_user_id = get_jwt_identity()

    if request.method == 'GET':
        # Return list of {message, reply, timestamp, id}
        chats = ChatHistory.query.filter_by(user_id=current_user_id).order_by(ChatHistory.timestamp.asc()).all()
        result = []
        for c in chats:
            result.append({
                "id": c.id,
                "message": c.message,
                "reply": c.reply,
                "timestamp": c.timestamp.isoformat()
            })
        return jsonify(result), 200

    if request.method == 'DELETE':
        # Clear all history for user
        ChatHistory.query.filter_by(user_id=current_user_id).delete()
        db.session.commit()
        return jsonify({"msg": "History deleted"}), 200


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5002)

