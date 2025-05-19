var password_state = false;
var max_server = 8;

var infos;
var list_server_nb;
var max_people_server =30;

var name_pseudo;
var mail;
var password;
var server_id;
var color = "#FFFFFF";
var banner_color = "#FFFFFF";
var list_friends;
var id_password;

var position_x=500;
var position_y=500;

var speed_x = 2;
var speed_y = 2;
var controller = {"a" : false,
                "d" : false,
                "w" : false,
                "s" : false}; //for all inputs and keys


//multiplayer
var profile_shown = {};


//cookies XD

function retrieveInfos() {
    id_password=cookie_get('id_password');
    if (!id_password) {
        console.error("id_password cookie not found");
        return;
    }
    communicate_get();
}


//update background color+caracter color too
document.addEventListener("input", updateColor, false);

function updateColor(event) {
    if (document.getElementById("profile_banner_color")!=null && document.getElementById("banner")!=null){
        document.getElementById("banner").style.backgroundColor = document.getElementById("profile_banner_color").value;
        document.getElementById("caracter").style.backgroundColor = document.getElementById("profile_color").value;
        document.getElementById("wrapper").style.borderColor = document.getElementById("profile_banner_color").value;
    }
}
window.addEventListener("load", (event) => {
    setListServer();
    if (cookie_get('id_password') != undefined){
        retrieveInfos();
        if (document.getElementById("set_list_server")) {
            getAllServerPeople();
        }
    }
    else{
        setLogin();
    }
    if (id_password != undefined){
        setConnectedTrue();
    }
    if(document.getElementsByName("play").length!=0){
        setInterval(function(){handleInput()},5);
        setInterval(function(){updatePosPlayer()},5);
    }
    if ((document.getElementById("friend")) || (document.getElementById("stranger"))) {
        mail = cookie_get("mail");
        GetProfile(mail);
    }
});


window.addEventListener("beforeunload", (event) => {
    if (id_password != undefined) {
        const url = 'http://localhost:5000/updateOnlineFalse';
        const data = JSON.stringify({ id_password: id_password });
        navigator.sendBeacon(url, data);
        
        const url2 = 'http://localhost:5000/updatePosition';
        const data2 = JSON.stringify({ id_password: id_password,  position_x: position_x, position_y: position_y});
        navigator.sendBeacon(url2, data2);
    }
});


//input handler
window.addEventListener("keydown", (event) => {
    key_down_control(event);
});
window.addEventListener("keyup", (event) => {
    key_up_control(event);
});

function key_up_control(e) {
    controller[e.key] = false;
}
function key_down_control(e) {
    controller[e.key] = true;
}

function setColorCararcter() {
    const player_graphics = document.getElementById("player_graphics");
    const player_name = document.getElementById("player_name");
    if (player_graphics!=undefined){
        player_graphics.style.backgroundColor = color;
        player_name.innerHTML = name_pseudo;
    }
}

function setListServer() {
    if (document.getElementById('set_list_server') != null){
        let str_list = "";
        for (let nb=1;nb<max_server+1;nb++){
            str_list += "<div class='list_server'> <span class='server_name'>Server "+nb.toString()+"</span> <button class='join_button' onclick='joinServer("+nb.toString()+")'>Join</button> <span class='people' id='people_nb_"+nb.toString()+"'>12/30</span> </div>";
        }
        document.getElementById('set_list_server').innerHTML = str_list;
    }
}

function setConnectedTrue(){
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

function getAllServerPeople(){
    fetch('http://localhost:5000/serverPeople', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ max_server_id : max_server})
    })
    .then(response => response.json())
    .then(data => {
        list_server_nb = data.result.split(',');
        setPeopleShow();
        console.log(data.result);
    })
    .catch(error => {
        console.error('Error:', error);
    });

    setTimeout(getAllServerPeople, 1500);   
}

function setPeopleShow(){
    for (let nb=0;nb<max_server;nb++){
        document.getElementById('people_nb_'+(nb+1).toString()).innerHTML = list_server_nb[nb].toString()+'/'+max_people_server.toString();
    }
}

function joinServer(server_id){
    if (id_password != null){
        fetch('http://localhost:5000/changeServer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ server_id: server_id,  id_password : id_password})
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.result);
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


//friends
function add_friend() {
    if (id_password!=undefined){
        friend_mail = cookie_get('mail');

        fetch('http://localhost:5000/addFriend', {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ mail : friend_mail, id_password : id_password})
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.result);
            open("other_profile_friend.html", "_self");
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
    else {
        open("login.html", "_self");
    }
}
function remove_friend() {
    if (id_password!=undefined){
        friend_mail = cookie_get('mail');

        fetch('http://localhost:5000/removeFriend', {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ mail : friend_mail, id_password : id_password})
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.result);
            open("other_profile_stranger.html", "_self");
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
    else {
        open("login.html", "_self");
    }
}

function see_profile(pers_mail) {
    console.log(pers_mail);
    var expiration_date=new Date(Date.now()+20*1000);
    document.cookie = `mail_seeing=${pers_mail}; ${expiration_date}`;
    //if friend...
    is_friend(pers_mail).then(isFriend => {
        if (isFriend == "True") {
            open("other_profile_friend.html", "_self");
        } else {
            open("other_profile_stranger.html", "_self");
        }
    });
}

function is_friend(mail) {
    return fetch('http://localhost:5000/isFriend', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mail : mail, id_password : id_password })
    })
    .then(response => response.json())
    .then(data => data.result) // assuming the server returns {result: true/false}
    .catch(error => {
        console.error('Error:', error);
    });
}

function setProfileStranger() {
    console.log(profile_shown["name"]);
    document.getElementById("wrapper").style.borderColor = profile_shown["banner_color"];
    document.getElementById('caracter').style.backgroundColor=profile_shown["color"];
    document.getElementById('banner').style.backgroundColor=profile_shown["banner_color"];
    document.getElementById("others_profile").innerHTML=
        ("<img src='https://icons.hackclub.com/api/icons/grey/profile-fill' style='position:absolute; left: 35px; top:38px; width:60px'>" +
        "<h2 class='profile_name' id='profile_name'>  "+profile_shown["name"]+"</h2>" +
        "<button class='profile_other_button' onclick='add_friend()'> <img class='profile_other_name_image' src='https://icons.hackclub.com/api/icons/white/friend' style='width:45px;'></button>"+
        "<p class='profile_mail' id='profile_mail'>" +profile_shown["mail"]+ "</p>"+
        "<p class='profile_server' id ='profile_server'> Server "+profile_shown["server"]+" </p>");
}

function setProfileFriend() {
    document.getElementById("wrapper").style.borderColor = profile_shown["banner_color"];
    document.getElementById('caracter').style.backgroundColor=profile_shown["color"];
    document.getElementById('banner').style.backgroundColor=profile_shown["banner_color"];
    document.getElementById("others_profile").innerHTML=
        ("<img src='https://icons.hackclub.com/api/icons/grey/profile-fill' style='position:absolute; left: 35px; top:38px; width:60px'>" +
        "<h2 class='profile_name' id='profile_name'>  "+profile_shown["name"]+"</h2>" +
        "<button class='profile_other_button_remove' onclick='remove_friend()'> <img class='profile_other_name_image_remove' src='https://icons.hackclub.com/api/icons/red/member-remove' style='width:45px;'></button>"+
        "<p class='profile_mail' id='profile_mail'>" +profile_shown["mail"]+ "</p>"+
        "<p class='profile_server' id ='profile_server'> Server "+profile_shown["server"]+" </p>");
}

function cookie_get(param){
    let infos = document.cookie.split(";");
    for (let part of infos){
        part=part.trim()
        if (part.startsWith(param)){
            return part.split('=')[1];
        }
    }
    return undefined;
}

function GetProfile(mail) {
    fetch('http://localhost:5000/getProfile', {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({mail:mail})
    })
    .then(response => response.json())
    .then(data => {
        let datas = data.result;
        let all_datas = datas.replace(")","").replaceAll("'","").replace("(","").split(",");
        console.log(all_datas)
        profile_shown["mail"]=mail;
        profile_shown["name"]=all_datas[0];
        profile_shown["server"]=all_datas[1];
        profile_shown["color"]=all_datas[2];
        profile_shown["banner_color"]=all_datas[3];
        is_friend(mail).then(isFriend => {
            if (isFriend == "True") {
                setProfileFriend();
            } else {
                setProfileStranger();
            }
        });
        
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function logOut() {
    document.cookie="id_password = ''; expires=Thu, 03 Aug 2008 12:00:00 UTC; path=/";
    
    open('login.html',"_self");
}


function setProfile() {
    document.getElementById("profile").innerHTML="<img src='https://icons.hackclub.com/api/icons/white/profile-fill' style='position: relative; top:4px; height:22px; overflow: hidden;'>"+name_pseudo;
    if (document.getElementById("others_profile")==null){
        if (document.getElementById("profile_name")!=null){
            document.getElementById("profile_name").innerHTML=name_pseudo;
        }
        if (document.getElementById("profile_mail")!=null){
            document.getElementById("profile_mail").innerHTML=mail;
        }
        if (document.getElementById("profile_server")!=null){
            document.getElementById("profile_server").innerHTML="Server "+server_id;
        }
        if (document.getElementById("list_friends")!=null){
            setFriendList();
        }
        if (document.getElementById("caracter")!=null){
            setColors();
        }
    }
}

function setFriendList() {
    const list = list_friends.split(";");
    var show_list = "";

    for (let nb in list){
        var virg = ",";
        if (nb == 0){
            virg="";
        }
        if (list[nb].trim() != ""){
            show_list+=virg+"<button class='friend_name' onclick='see_profile("+'"'+list[nb].trim()+'"'+")'>"+list[nb].trim()+"</button>";
        }
    }
    console.log(show_list);
    document.getElementById('list_friends').innerHTML = show_list;
}

function setColors() {
    document.getElementById("wrapper").style.borderColor = banner_color;
    document.getElementById('caracter').style.backgroundColor = color;
    document.getElementById('banner').style.backgroundColor = banner_color;
}
function setLogin() {
    document.getElementById("profile").innerHTML="<img src='https://icons.hackclub.com/api/icons/white/profile-fill' style='position: relative; top:4px; height:22px; overflow: hidden;'>"+"Log In";
}

function setProfileShow() {
    if (document.getElementById("profile_name")!= null && document.getElementById("profile_password")!=null&& document.getElementById("profile_color")!=null&& document.getElementById("profile_banner_color")!=null){
        let p_name = document.getElementById("profile_name").value;
        let pass = document.getElementById("profile_password").value;
        let col = document.getElementById("profile_color").value;
        let banner_col = document.getElementById("profile_banner_color").value;

        //set the new name and password
        //send to the database the mail and password to check if it connects
        fetch('http://localhost:5000/updateProfile', {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name : p_name, password : pass, color : col, banner_color : banner_col, id : id_password})
        })
        .then(response => response.json())
        .then(data => {
            communicate_get();
            console.log(data.result);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }


    document.getElementById("modifie_profile").innerHTML=
        ("<img src='https://icons.hackclub.com/api/icons/grey/profile-fill' style='position:absolute; left: 35px; top:38px; width:60px;'> "
        +"<h2 class='profile_name' id='profile_name'> "+name_pseudo+" </h2>"
        +"<button class='profile_button' onclick='setProfileModifie()'> <img class='profile_name_image' src='https://icons.hackclub.com/api/icons/white/edit' style='width:45px;'></button> "
        +"<p class='profile_mail' id='profile_mail'> "+ mail +" </p>"
        +"<p class='profile_server' id='profile_server'> Server "+server_id+" </p>"
        +"<button class='log_out_button' onclick='logOut()'> <img class='log_out_image' src='https://icons.hackclub.com/api/icons/white/door-leave' style='width:45px;'></button> ");

}

function setProfileModifie() {

    document.getElementById("modifie_profile").innerHTML=
        ("<input type='color' value='"+banner_color+"' id='profile_banner_color' style='position:absolute;right:10px;top:135px;'>"
        +"<input type='color' value='"+color+"' id='profile_color' style='width: 30px;height: 25px;position:absolute;left:100px;top:200px;'>"
        +"<img src='https://icons.hackclub.com/api/icons/grey/profile-fill' style='position:absolute; left: 35px; top:38px; width:60px'> "
        +"<input class='profile_name' id='profile_name' placeholder="+name_pseudo+" style='height:34px; width:200px; font-size: 32px; color:black;'>"
        +"<button class='profile_button' onclick='setProfileShow(event)'> <img class='save_profile' src='https://icons.hackclub.com/api/icons/white/post' style='padding-top: 2px; padding-bottom: -2px; width:45px;'></button>" 
        +"<p class='profile_mail' id='profile_mail'> "+ mail +" </p>"
        +"<img src='https://icons.hackclub.com/api/icons/grey/private-outline' class='profile_password_icon'><input class='profile_password' id='profile_password' placeholder="+password+">"
        +"<p class='profile_server'> Server "+server_id+" </p>");
}


function openProfile() {
    if (!id_password) {
        window.open("login.html","_self");
    }
    else{
        window.open("profile.html","_self");
    }
}

function sendMail(event){
    event.preventDefault();
  
    const email = document.getElementById('mail_input').value;
    document.getElementById('hint_folder').innerText = 'Look into your spam folder.';

    if (email == ""){
        alert("Please enter an email");
    }
    else{
        fetch('http://localhost:5000/changePasswordRequest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById('status').innerText = data.result;
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('status').innerText = 'Failed.';
        });
    }
}

function passwordShow(event) {
    event.preventDefault();
    if (password_state == true) {
        password_state=false;
        let ui_elt = document.getElementById("show_password_active");
        let ui_input = document.getElementById("password_input");
        ui_elt.src="https://icons.hackclub.com/api/icons/grey/view";
        ui_elt.id="show_password_inactive";
        ui_input.type = "password";
    }
    else{
        password_state=true;
        let ui_elt = document.getElementById("show_password_inactive");
        let ui_input = document.getElementById("password_input");
        ui_elt.src="https://icons.hackclub.com/api/icons/grey/private-fill";
        ui_elt.id="show_password_active";
        ui_input.type = "text";
    }
}


function submitLogin(event) {
    event.preventDefault();
    let mail = document.getElementById('mail_input').value;
    let password = document.getElementById('password_input').value;


    if (mail!=""){
        //send to the database the mail and password to check if it connects
        log_in(mail, password);
    }
}

function log_in(mail, password){
    fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mail : mail, password : password})
    })
    .then(response => response.json())
    .then(data => {
        if (data.result == "Error-not_in_data_base"){
            alert('Error : This mail is not linked to an account');
            open("register.html");
            console.error(data.result);
        }
        else if (data.result == "Error-password_incorrect"){
            alert('Error : Password incorrect');
            console.error(data.result);
        }
        else{
            id_password = data.result;
            var expiration_date=new Date(Date.now()+20*1000);
            document.cookie = `id_password=${id_password}; ${expiration_date}`;
            console.log(document.cookie);
            retrieveInfos();
            setProfile();
            open('profile.html',"_self")
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function setNewPassword(event){
    event.preventDefault();
    let id_password = window.location.search.substring(1).replace("id_password=","");
    console.log(id_password);
    let new_password = document.getElementById('password_input').value;
    fetch('http://localhost:5000/changePassword', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mail : mail, new_password : new_password, id_password : id_password})
    })
    .then(response => response.json())
    .then(data => {
        if (data.result == "Error"){
            alert('Error');
            console.error(data.result);
        }
        else{
            console.log(data.result);
            var expiration_date=new Date(Date.now()+20*1000);
            document.cookie = `id_password=${id_password}; ${expiration_date}`;
            console.log(document.cookie);
            retrieveInfos();
            setProfile();
            open('profile.html',"_self")
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}


function submitRegister(event) {
    event.preventDefault();
    let name = document.getElementById('name_input').value;
    let mail = document.getElementById('mail_input').value;
    let password = document.getElementById('password_input').value;


    //send to the database the mail and password to check if it connects
    fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({name : name, mail : mail, password : password})
    })
    .then(response => response.json())
    .then(data => {
        log_in(mail, password);
        if (data.result == "Error-already_in_database"){
            alert("email already used");
            console.error(data.result);
        }
        else{
            //success
            console.log(data.result+'lol');
        }

    })
    .catch(error => {
        console.error('Error:', error);
    });
}

//PLAY PART

function handleInput(){
    list = [0,0,0,0];

    for(var key in controller) {
        var value = controller[key];
        if (value==true) {
            //we do smth
            if (key == "a"){
                list[0] = speed_x;
            }if (key == "d"){
                list[1] = speed_x;
            }if (key == "w"){
                list[2] = speed_y;
            }if (key == "s"){
                list[3] = speed_y;
            }
        }
    }
    movePlayer(position_x-list[0]+list[1], position_y-list[2]+list[3]);
}

function movePlayer(x, y, name='player'){
    if (name == "player"){
        if (x!=position_x && y!=position_y){
            mid_x=(x-position_x)*0.71;
            mid_y=(y-position_y)*0.71;
            if (checkForOutOfBounds(position_x+mid_x,position_y+mid_y) == false) {
                position_x = position_x+mid_x;
                position_y = position_y+mid_y;
            }
        }
        else{
            if (checkForOutOfBounds(x,y) == false) {
                position_x = x;
                position_y = y;
            }
        }
    }
    else {
        //we are moving a another player
    }
}
/*
function speedModifier() {
    if ((controller["a"] == true || controller["d"] == true) && speed_x<max_speed){
        speed_x*=acc;
    }
    if ((controller["s"] == true || controller["w"] == true) && speed_y<max_speed){
        speed_y*=acc;
    }
    if (controller["a"] == false && controller["d"] == false && speed_x>norm_speed){
        speed_x*=friction;
        if (last_keys_axis["horizontal"] == "a"){
            console.log(speed_x)
            movePlayer(position_x+speed_x, position_y);
        }if (last_keys_axis["horizontal"] == "d"){
            movePlayer(position_x-speed_x, position_y);
    }
    if (controller["a"] == false && controller["d"] == false && speed_y>norm_speed){
        speed_y*=friction;
        }if (last_keys_axis["vertical"] == "s"){
            movePlayer(position_x, position_y-speed_y);
        }if (last_keys_axis["vertical"] == "w"){
            movePlayer(position_x, position_y+speed_y);
        }
    }
}*/

function updatePosPlayer() {
    const player = document.getElementById("player");
    if (player!=undefined){
        player.style.left = position_x + "px";
        player.style.top = position_y + "px";
    }
}

function checkForOutOfBounds(pos_x, pos_y) {
    const delta_x = 3/100;
    const delta_y = 8/100;
    if (pos_x+delta_x*window.innerWidth>window.innerWidth-delta_x*window.innerWidth||pos_x<delta_x*window.innerWidth){
        return true;
    }
    if (pos_y+delta_y*window.innerHeight>window.innerHeight-delta_y*window.innerHeight||pos_y<delta_y*window.innerHeight){
        return true;
    }
    return false;
}

//COMMUNICATION


function communicate_get() {
    if (id_password != undefined){
        //send to the database the id_password
        fetch('http://localhost:5000/communicate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id : id_password})
        })
        .then(response => response.json())
        .then(data => {
            if (data.result == "Error-idpassword incorrect"){
                console.error(data.result, id_password);
            }
            else{
                let str_res =data.result.replace('(','').replace(')','').replace("'",'');
                infos=str_res.split(",");
                name_pseudo = infos[0];
                mail = infos[1];
                password = infos[2];
                server_id = infos[3];
                color = infos[4].trim();
                banner_color = infos[5].trim();
                online = infos[6];
                list_friends = infos[7];
                setProfile();
                if (document.getElementById("player")) {
                    setColorCararcter();
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}