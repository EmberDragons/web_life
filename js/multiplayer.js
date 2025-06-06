

//MULTIPLAYER communication


export function getpeopleOnline(){
    fetch('http://localhost:5000/getNBPeopleOnline', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        //console.log(data.result);
        nb_people_online=data.result;
        setNbConnected();
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

export function getpeopleRegistered(){
    fetch('http://localhost:5000/getNBPeople', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        nb_people_registered=data.result;
        setNbRegistered();
    })
    .catch(error => {
        console.error('Error:', error);
    });
}



export function set_position_db() {
    if (mail){
        fetch('http://localhost:5000/updatePos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ mail : mail, server_id : server_id, pos_x:position_x, pos_y : position_y})
        })
        .then(response => response.json())
        .then(data =>{
            if (data.result == "not in data_base"){
                add_to_db()
            }
        });
    }
}

export function add_to_db() {
    if (mail){
        fetch('http://localhost:5000/addToList', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ mail:mail, name:name_pseudo, server_id:server_id, color:color})
        })
        .then(response => response.json())
        .then(data =>{
        });
    }
}





//multiplayer part

export function multiplayer_get() {
    if (server_id != undefined){
        //send to the database the id_password
        fetch('http://localhost:5000/multiplayer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ server_id : server_id})
        })
        .then(response => response.json())
        .then(data => {
            if (data.result == "Error-server_id incorrect"){
                console.error(data.result, server_id);
            }
            else{
                var all_data = data.result.split('|');
                for (let string in all_data){
                    let str_res = all_data[string].replace('(','').replace(')','').replace("'",'');
                    let mult_infos=str_res.split(",");
                    let mail_pers = mult_infos[0].toString().trim();
                    let name_pers = mult_infos[1];
                    let color_pers = mult_infos[2];
                    let position_x_pers = parseFloat(mult_infos[3]);
                    let position_y_pers = parseFloat(mult_infos[4]);

                    if (mail_pers != mail.trim() && mail_pers!=""){
                        if (!(mail_pers in dict_people_serv)){
                            add_multiplayer(mail_pers, name_pers, color_pers);
                        }
                        else{
                            let posi_x = dict_people_serv[mail_pers].pos_x;
                            let posi_y = dict_people_serv[mail_pers].pos_y;
                            let infos_pers = {"name":name_pers, "color":color_pers, "target_pos_x" : position_x_pers, "target_pos_y" : position_y_pers, "pos_x":posi_x, "pos_y":posi_y, "time":0};
                            
                            dict_people_serv[mail_pers] = infos_pers;
                        }
                    }
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}

export function add_multiplayer(mail_pers, name, color) {
    //visual
    let text = "<div id='"+mail_pers+"' class='player_main'> <img src='https://icons.hackclub.com/api/icons/grey/down-caret' alt='Hack Club' class='player_arrow'><button class='player_name' id='"+mail_pers.trim()+"_name' onclick='see_profile("+'"'+mail_pers+'"'+")'>"+name+"</button><div class='player_graphics' id='"+mail_pers.trim()+"_graphics'></div></div>";
    document.getElementById("Canvas").innerHTML=document.getElementById("Canvas").innerHTML+text;
    const player_graphics = document.getElementById(mail_pers.trim()+"_graphics");
    player_graphics.style.backgroundColor=color;
    //the rest
    let infos_pers = {"name":name, "color":color, "target_pos_x" : 500, "target_pos_y" : 500, "pos_x":500, "pos_y":500, "time" : 0};
    dict_people_serv[mail_pers] = infos_pers;
}

export function remove_multiplayer(n_mail) {
    //visual remove
    const playerDiv = document.getElementById(n_mail);
    if (playerDiv) {
        playerDiv.remove();
    }
    //remove complete
    delete dict_people_serv[n_mail];
}

export function move_all_multiplayer() {
    for (let n_mail in dict_people_serv){
        dict_people_serv[n_mail]["time"]+=0.005;
        if (dict_people_serv[n_mail]["time"]>=0.2){
            //we remove it
            remove_multiplayer(n_mail);
        }
        else{

        }
    }
}

export function updatePosMultiplayer() {
    for (let n_mail in dict_people_serv){
        let player = document.getElementById(n_mail);
        let x_dir = (parseFloat(dict_people_serv[n_mail]["target_pos_x"]) - parseFloat(dict_people_serv[n_mail]["pos_x"]));
        let y_dir = (parseFloat(dict_people_serv[n_mail]["target_pos_y"]) - parseFloat(dict_people_serv[n_mail]["pos_y"]));
        if ((x_dir**2)**0.5>move_mult_speed){
            if (x_dir>0){
                x_dir=move_mult_speed+x_dir/50;
            }
            else{
                x_dir=-move_mult_speed+x_dir/50;
            }
        }
        if ((y_dir**2)**0.5>move_mult_speed){
            if (y_dir>0){
                y_dir=move_mult_speed+y_dir/50;
            }
            else{
                y_dir=-move_mult_speed+y_dir/50;
            }
        }
        let x = dict_people_serv[n_mail]["pos_x"]+x_dir;
        let y = dict_people_serv[n_mail]["pos_y"]+y_dir;
        dict_people_serv[n_mail].pos_x=x;
        dict_people_serv[n_mail].pos_y=y;

        if (player!=undefined){
            player.style.left = (x).toString() + "px";
            player.style.top = (y).toString() + "px";
            for (let _elt in link_player_msg){
                if (link_player_msg[_elt][0] == n_mail){
                    let text = document.getElementById(link_player_msg[_elt][1]);
                    if (text != undefined){
                        text.style.left= (x).toString() + "px";
                        text.style.top= (y-30).toString() + "px";
                    }
                }
            }
            
            const player_graphics = document.getElementById(n_mail.trim()+"_graphics");
            if (player_graphics != undefined && (x_dir !=0 || y_dir != 0)){
                if (player_graphics.style.opacity == 0.99){
                    player_graphics.style.zoom=(parseFloat(player_graphics.style.zoom)+0.01).toString();
                    player_graphics.style.rotate=("2deg");
                    if (player_graphics.style.zoom>1.05){
                        player_graphics.style.opacity = 1;
                    }
                }
                else{
                    player_graphics.style.zoom=(parseFloat(player_graphics.style.zoom)-0.01).toString();
                    player_graphics.style.rotate=("-2deg");
                    if (player_graphics.style.zoom<0.95){
                        player_graphics.style.opacity = 0.99;
                    }
                }
                if (player_graphics.style.opacity == ""){
                    player_graphics.style.opacity = 0.99;
                }
                if (player_graphics.style.zoom == ""){
                    player_graphics.style.zoom=1;
                }
            }
        }
    }
}
