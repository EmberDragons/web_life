
export function check_ping() {
    var past_time = Date.now();
    var time_elapsed = 0.0;
    if (server_id){
        fetch('http://localhost:5000/ping', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({server_id:server_id})
        })
        .then(response => response.json())
        .then(data =>{
            time_elapsed = Date.now()-past_time;
            console.log('time to server : '+time_elapsed.toString());
        });
    }
}

export function check_ping_inside_database() {
    var past_time = Date.now();
    var time_elapsed = 0.0;
    if (mail){
        fetch('http://localhost:5000/pingInsideDatabase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({mail:mail})
        })
        .then(response => response.json())
        .then(data =>{
            time_elapsed = Date.now()-past_time;
            console.log('time to database : '+time_elapsed.toString());
        });
    }
}

