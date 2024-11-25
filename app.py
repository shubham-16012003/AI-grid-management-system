from flask import Flask, render_template, jsonify, request
import threading
import time

app = Flask(__name__)

# Initial load value
current_load = 0  # Start with 0 as requested

@app.route('/')
def index():
    return render_template('index.html')  # Render the frontend HTML page

@app.route('/get_load', methods=['GET'])
def get_load():
    """Provide the current grid load to the frontend."""
    return jsonify({"load": current_load})

@app.route('/update_load', methods=['POST'])
def update_slider():
    """Update the current grid load based on slider input."""
    global current_load
    data = request.json
    current_load = float(data['load'])  # Update load value
    return jsonify({"status": "success"})

if __name__ == '__main__':
    app.run(debug=True)
