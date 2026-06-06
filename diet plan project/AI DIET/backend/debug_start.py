print("Starting debug...")
try:
    from model import chat_response
    print("Model imported successfully")
except Exception as e:
    print(f"Error importing model: {e}")

from flask import Flask
print("Flask imported")

app = Flask(__name__)
print("App created")

if __name__ == "__main__":
    print("Running app...")
    # Run slightly different port to avoid conflicts if the other is zombied
    app.run(port=5001)
