export function setListServer(max_server) {
    if (document.getElementById('set_list_server') != null){
        let str_list = "";
        for (let nb=1;nb<max_server+1;nb++){
            str_list += "<div class='list_server'> <span class='server_name'>Server "+nb.toString()+"</span> <button class='join_button' onclick='joinServer("+nb.toString()+")'>Join</button> <span class='people' id='people_nb_"+nb.toString()+"'>12/30</span> </div>";
        }
        document.getElementById('set_list_server').innerHTML = str_list;
    }
}

export function setConnectedTrue(id_password){
    fetch('http://localhost:5000/updateOnlineTrue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_password : id_password})
    })
    .then(response => response.json())
    .then(data => {
        //console.log(data.result);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

export function getAllServerPeople(max_server){
    fetch('http://localhost:5000/serverPeople', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ max_server_id : max_server})
    })
    .then(response => response.json())
    .then(data => {
        list_server_nb = data.result.split(',');
        setPeopleShow();
    })
    .catch(error => {
        console.error('Error:', error);
    });

    setTimeout(getAllServerPeople, 1500);   
}

export function setPeopleShow(){
    for (let nb=0;nb<max_server;nb++){
        document.getElementById('people_nb_'+(nb+1).toString()).innerHTML = list_server_nb[nb].toString()+'/'+max_people_server.toString();
    }
}

export function joinServer(server_id){
    if (id_password != null){
        fetch('http://localhost:5000/changeServer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ server_id: server_id,  id_password : id_password, mail:mail})
        })
        .then(response => response.json())
        .then(data => {
            open("play.html",'_self');
        })
        .catch(error => {
            console.error('Error:', error);
        });
        
    }
    else{
        open("login.html", "_self");
    }
}