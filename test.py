from flask import Flask, render_template
from flask_socketio import SocketIO
from flask_cors import CORS

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret'
CORS(app, origins=["https://test-run-phi.vercel.app"])
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/')
def index():
    return render_template('test.html')

@socketio.on('my event')
def handle_my_custom_event(json):
    print('received json: ' + str(json))
    return str(json)

if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000)