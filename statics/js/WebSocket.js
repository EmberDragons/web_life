const SERVER_ADRESS = 'http://localhost:5000';

export class WebSocket {
    constructor() {
        this.socket = io(SERVER_ADRESS, {
            withCredentials: true,
            extraHeaders: {
                "Access-Control-Allow-Origin": "access"
            }
        });

        
        socket.on('connect', function() {
            socket.emit('my event', {data: 'I\'m connected!'});
        });
    }
    
    sendPos() {
        socket.emit('my event', {data: "1000"}, function(response) {
            console.log("Server replied:", response);
        });
    }
}
