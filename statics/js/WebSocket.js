import { SERVER_ADRESS } from "../script.js";

export class WebSocket {
    constructor() {
        this.socket = io(SERVER_ADRESS, {
            withCredentials: true,
            transports: ["websocket", "polling"]
        });
        this.socket.emit('my event', {data: 'I\'m connected!'});
    }
    
    getAllServerPeople() {
        return new Promise((resolve, reject) => {
            if (document.getElementById("set_list_server")) {
                this.socket.emit('serverPeople', function(response) {
                    if (response && response['result']) {
                        resolve(response['result'].split(','));
                    } else {
                        reject('No response');
                    }
                });
            } else {
                resolve(null);
            }
        });
    }

    getObjects() {
        return new Promise((resolve, reject) => {
            //send to the server the emoji
            this.socket.emit('getObjectList', function(response) {
                if (response && response['result']) {
                    resolve(response['result'].split("𩸽"));
                } else {
                    reject('No response');
                }
            });
        });
    }

    updatePos(dict) {
        this.socket.emit('updatePos', dict);
    }

    addEmoji(dict) {
        this.socket.emit('addEmojiList', dict);
    }
    addText(dict) {
        this.socket.emit('addTextList', dict);
    }
}
