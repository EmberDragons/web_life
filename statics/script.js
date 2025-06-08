import { FRAMERATE, GameLoop } from './js/GameLoop.js';
import { WebSocket } from './js/WebSocket.js';
import { CodiFiePassword } from './js/Password.js';

export const SERVER_ADRESS = 'https://1148-2a02-8428-37af-b01-c42c-6a19-5665-cf5d.ngrok-free.app';

var password_state = false;
var max_server = 8;

var infos;
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

var speed_x = 4;
var speed_y = 4;
var controller = {"a" : false,
                "d" : false,
                "w" : false,
                "s" : false}; //for all inputs and keys

var can_move=true;

//online
var online = false;

var nb_people_online = 0;
var nb_people_registered = 0;


//multiplayer
var canSetPosDB = false;

var profile_shown = {};
var dict_people_serv = {};
const move_mult_speed = 2;

//emojis
var emoji_dict={}
var wait_next_date;

let imgName = "https://imgur.com/Tk5i9I7.png";
let imgHandle;
const pickerImageOpts = {
    types: [
        {
        description: "Images",
        accept: {
            "image/*": [".png", ".gif", ".jpeg", ".jpg"],
        },
        },
    ],
    excludeAcceptAllOption: true,
    multiple: false,
};
//chat message

var input_chat;
const max_caracters = 250;
var text_dict={};
var link_player_msg=[];



//game loop 

const update = () => {
    currentFrameShort++;
    currentFrameLong++;
    handleInput();
    move_all_multiplayer();

    if (currentFrameShort == Math.round(shortFrame*FRAMERATE)) GET_SHORT();
    if (currentFrameLong == Math.round(longFrame*FRAMERATE)) GET_LONG();
}

const draw = () => {
    updatePosPlayer();
    updatePosMultiplayer();
}

const GET_SHORT = () => {
    currentFrameShort=0;


    getAllServerPeople();
    getObjects();
    set_position_server();
}

const GET_LONG = () => {
    currentFrameLong=0;

    //no fetch
    removeText();
    removeEmojis();
}

//socket io code set up
var playing = false;

const webSocket = new WebSocket();
webSocket.socket.on("position", function(data) {
    let mail_pers = data["mail"];
    let t_server_id = data["server_id"];
    let pos_x = data["pos_x"];
    let pos_y = data["pos_y"];
    let name = data["name"];
    let color = data["color"];
    multiplayerCheck(t_server_id, mail_pers, name, pos_x, pos_y, color);
});


//actual lauched gameLoop
const gameLoop = new GameLoop(update, draw);

const shortFrame = 0.3; //time in sec to wait for new short call
const longFrame = 10; //time in sec to wait for new long call

var currentFrameShort=0;
var currentFrameLong=0;


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
    }
    else{
        setLogin();
    }
    if (id_password != undefined){
        setConnectedTrue();
        gameLoop.start();
    }
    if ((document.getElementsByName("play").length)!=0){
        playing=true;
    }
    if ((document.getElementById("friend")) || (document.getElementById("stranger"))) {
        let n_mail = cookie_get("mail_seeing");
        GetProfile(n_mail);
    }
    getpeopleOnline();
    getpeopleRegistered();
});


window.addEventListener("beforeunload", (event) => {
    gameLoop.stop();
    if (id_password != undefined) {
        const url = SERVER_ADRESS+'/updateOnlineFalse';
        const data = JSON.stringify({ id_password: id_password });
        navigator.sendBeacon(url, data);
        
        const url2 = SERVER_ADRESS+'/removeToList';
        const data2 = JSON.stringify({ mail:mail});
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

window.addEventListener("DOMContentLoaded", () => {
    input_chat = document.getElementById("chat_bar");
    if (input_chat) {
        input_chat.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                sendMessage();
            }
        });
        input_chat.addEventListener("focus", (event) => {
            can_move=false;
        });
        input_chat.addEventListener("blur", (event) => {
            can_move=true;
        });
    }
});

function key_up_control(e) {
    controller[e.key] = false;
}
function key_down_control(e) {
    controller[e.key] = true;
}

//function for index set up

function setNbConnected() {
    let html_part = document.getElementById("number_connected");
    if (html_part!=undefined){
        html_part.innerHTML = nb_people_online;
    }
}

function setNbRegistered() {
    let html_part = document.getElementById("number_registered");
    if (html_part!=undefined){
        html_part.innerHTML = nb_people_registered;
    }
}

function getpeopleOnline(){
    fetch(SERVER_ADRESS+'/getNBPeopleOnline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ id_password : id_password})
    })
    .then(response => response.json())
    .then(data => {
        nb_people_online=data.result;
        setNbConnected();
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function getpeopleRegistered(){
    fetch(SERVER_ADRESS+'/getNBPeople', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ id_password : id_password})
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
    fetch(SERVER_ADRESS+'/updateOnlineTrue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
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
    if (document.getElementById("set_list_server")) {
        webSocket.getAllServerPeople().then(list => {
            if (list!=null) {
                setPeopleShow(list);
            }
        });
    }   
}

function setPeopleShow(list){
    console.log(list, max_server);
    for (let nb=0;nb<max_server;nb++){
        document.getElementById('people_nb_'+(nb+1).toString()).innerHTML = list[nb].toString()+'/'+max_people_server.toString();
    }
}

function joinServer(server_id){
    if (id_password != null){
        fetch(SERVER_ADRESS+'/changeServer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' ,
                },
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


//friends
function add_friend() {
    if (id_password!=undefined){
        let friend_mail = cookie_get('mail_seeing');

        fetch(SERVER_ADRESS+'/addFriend', {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                
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
        let friend_mail = cookie_get('mail_seeing');

        fetch(SERVER_ADRESS+'/removeFriend', {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                
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
    return fetch(SERVER_ADRESS+'/isFriend', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' ,
                },
        body: JSON.stringify({ mail : mail, id_password : id_password })
    })
    .then(response => response.json())
    .then(data => data.result) // assuming the server returns {result: true/false}
    .catch(error => {
        console.error('Error:', error);
    });
}

function setProfileStranger() {
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
    fetch(SERVER_ADRESS+'/getProfile', {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            
        },
        body: JSON.stringify({mail:mail})
    })
    .then(response => response.json())
    .then(data => {
        let datas = data.result;
        let all_datas = datas.replace(")","").replaceAll("'","").replace("(","").split(",");
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
        let n_pass = CodiFiePassword(pass); //btw n_pass is for new password, please ...

        let col = document.getElementById("profile_color").value;
        let banner_col = document.getElementById("profile_banner_color").value;

        //set the new name and password
        //send to the database the mail and password to check if it connects
        if (forbidSTR(p_name) && p_name.length <=20){
            fetch(SERVER_ADRESS+'/updateProfile', {
                method: 'POST',
                mode: 'cors',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    
                },
                body: JSON.stringify({ name : p_name, password : n_pass, color : col, banner_color : banner_col, id : id_password})
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
    }


    document.getElementById("modifie_profile").innerHTML=
        ("<img src='https://icons.hackclub.com/api/icons/grey/profile-fill' style='position:absolute; left: 35px; top:38px; width:60px;'> "
        +"<h2 class='profile_name' id='profile_name'> "+name_pseudo+" </h2>"
        +"<button class='profile_button' onclick='setProfileModifie()'> <img class='profile_name_image' src='https://icons.hackclub.com/api/icons/white/edit' style='width:45px;'></button> "
        +"<p class='profile_mail' id='profile_mail'> "+ mail +" </p>"
        +"<div id='list_friends' style='position:absolute;right:60px;top:180px; width:250px;'><button class='friend_name' onclick='see_profile('none')'> none</button></div>"
        +"<p class='profile_server' id='profile_server'> Server "+server_id+" </p>"
        +"<button class='log_out_button' onclick='logOut()'> <img class='log_out_image' src='https://icons.hackclub.com/api/icons/white/door-leave' style='width:45px;'></button> ");

    if (document.getElementById("list_friends")!=null){
        setFriendList();
    }
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
        open("login.html","_self");
    }
    else{
        open("profile.html","_self");
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
        fetch(SERVER_ADRESS+'/changePasswordRequest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' ,
                },
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
    //we are going to codifie this pass word lmao:
    let n_password = CodiFiePassword(password);


    if (mail!=""){
        //send to the database the mail and password to check if it connects
        log_in(mail, n_password);
    }
}

function log_in(mail, password){
    fetch(SERVER_ADRESS+'/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            
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
    let new_password = document.getElementById('password_input').value;
    //we are going to codifie this pass word lmao:
    let n_password = CodiFiePassword(new_password);
    fetch(SERVER_ADRESS+'/changePassword', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            
        },
        body: JSON.stringify({ mail : mail, new_password : n_password, id_password : id_password})
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
    //we are going to codifie this pass word lmao:
    let n_password = CodiFiePassword(password);

    const regex_test = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (mail.length>5 && regex_test.test(mail) && forbidSTR(name) && forbidSTR(mail)){
        //then we accept the email
        //send to the database the mail and password to check if it connects
        fetch(SERVER_ADRESS+'/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                
            },
            body: JSON.stringify({name : name, mail : mail, password : n_password})
        })
        .then(response => response.json())
        .then(data => {
            log_in(mail, n_password);
            if (data.result == "Error-already_in_database"){
                alert("email already used");
                console.error(data.result);
            }
            else{
                //success
                console.log(data.result);
            }

        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
    else {
        alert("email or name is forbidden");
    }
}

function forbidSTR(str){
    let returnVal = (!str.includes(";") && !str.includes(",") && !str.includes("𩸽") && !str.includes("§"));
    return returnVal;
}

//PLAY PART

function handleInput(){
    if (can_move==true){
        var list = [0,0,0,0];
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
}

function movePlayer(x, y){
    if (x!=position_x && y!=position_y){
        var mid_x=(x-position_x)*0.71;
        var mid_y=(y-position_y)*0.71;
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
    
    /*Check if message player => then move it */
    for (let elt in link_player_msg){
        if (link_player_msg[elt][0] == mail){
            let text = document.getElementById(link_player_msg[elt][1]);
            if (text!=undefined){
                text.style.left= (position_x).toString() + "px";
                text.style.top= (position_y-30).toString() + "px";
            }
        }
    }
}
function updatePosPlayer() {
    const player = document.getElementById("player");
    const player_graphics = document.getElementById("player_graphics");
    if (player_graphics != undefined && (roundNumber(position_x, 10)+"px" != player.style.left || roundNumber(position_y, 10)+"px" != player.style.top)){
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

    if (player!=undefined){
        player.style.left = position_x + "px";
        player.style.top = position_y + "px";
    }
}
function roundNumber(number, digits) {
    var multiple = Math.pow(10, digits);
    var rndedNum = Math.round(number * multiple) / multiple;
    return rndedNum;
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
        fetch(SERVER_ADRESS+'/communicate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                
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
                mail = infos[1].trim();
                password = "change_password"; //you gotta find an other way man
                server_id = infos[3];
                color = infos[4].trim();
                banner_color = infos[5].trim();
                online = infos[6];
                list_friends = infos[7];
                setProfile();
                if (document.getElementById("player")) {
                    setColorCararcter();
                }
                add_to_db()
                canSetPosDB=true;
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}


//MULTIPLAYER communication



function add_to_db() {
    if (mail){
        fetch(SERVER_ADRESS+'/addToList', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                
            },
            body: JSON.stringify({ mail:mail, name:name_pseudo, server_id:server_id, color:color})
        })
        .then(response => response.json())
        .then(data =>{
        });
    }
}

function check_ping() {
    var past_time = Date.now();
    var time_elapsed = 0.0;
    if (server_id){
        fetch(SERVER_ADRESS+'/ping', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                
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

function check_ping_inside_database() {
    var past_time = Date.now();
    var time_elapsed = 0.0;
    if (mail){
        fetch(SERVER_ADRESS+'/pingInsideDatabase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                
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

//multiplayer part
function set_position_server() {
    if (canSetPosDB){
        if (mail){
            webSocket.updatePos({mail: mail, server_id: server_id, pos_x: position_x, pos_y: position_y, name: name_pseudo, color: color});
        }
    }
}

function multiplayerCheck(t_server_id, mail_pers, name_pers, position_x_pers, position_y_pers, color_pers) {
    if (t_server_id == server_id && mail_pers != mail.trim() && mail_pers!=""){
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


function add_multiplayer(mail_pers, name, color) {
    //visual
    if (document.getElementById("Canvas") != null){
        let text = "<div id='"+mail_pers+"' class='player_main'> <img src='https://icons.hackclub.com/api/icons/grey/down-caret' alt='Hack Club' class='player_arrow'><button class='player_name' id='"+mail_pers.trim()+"_name' onclick='see_profile("+'"'+mail_pers+'"'+")'>"+name+"</button><div class='player_graphics' id='"+mail_pers.trim()+"_graphics'></div></div>";
        document.getElementById("Canvas").innerHTML=document.getElementById("Canvas").innerHTML+text;
        const player_graphics = document.getElementById(mail_pers.trim()+"_graphics");
        player_graphics.style.backgroundColor=color;
        //the rest
        let infos_pers = {"name":name, "color":color, "target_pos_x" : 500, "target_pos_y" : 500, "pos_x":500, "pos_y":500, "time" : 0};
        dict_people_serv[mail_pers] = infos_pers;
        console.log(dict_people_serv);
    }
}

function remove_multiplayer(n_mail) {
    //visual remove
    const playerDiv = document.getElementById(n_mail);
    if (playerDiv) {
        playerDiv.remove();
    }
    //remove complete
    delete dict_people_serv[n_mail];
}

function move_all_multiplayer() {
    for (let n_mail in dict_people_serv){
        dict_people_serv[n_mail]["time"]+=1;
        if (dict_people_serv[n_mail]["time"]>=FRAMERATE*2.5){ // .. secs ecoule
            //we remove it
            remove_multiplayer(n_mail);
        }
    }
}

function updatePosMultiplayer() {
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

// multiplayer emojis

function addEmoji(nb) {
    if (wait_next_date == undefined || Date.now()-wait_next_date>=2000){
        if (nb!=6){
            wait_next_date=Date.now();
            var code = document.getElementById(nb).innerHTML;
            showEmoji(code, Date.now(), false);
            //send to the server the emoji
            
            webSocket.addEmoji({code : code, date:wait_next_date, pos_x:position_x, pos_y:position_y, is_img:false});
        }
        else {
            if (imgName!=undefined){
                wait_next_date=Date.now();
                var link = imgName;
                showEmoji(link, Date.now(), true);
                //send to the server the emoji
                webSocket.addEmoji({code : link, date:wait_next_date, pos_x:position_x, pos_y:position_y, is_img:true});
            }
        }
    }
}


function getObjects() {
    if (playing == true){
        webSocket.getObjects().then(list => {
            if (list!=null) {
                showObjects(list);
            }
        });
    }
}

function showObjects(all_elts) {
    for (let elt in all_elts){
        if (all_elts[elt] != ''){
            let infos = all_elts[elt].split('§');
            if (infos[0] == 1 || infos[0] == "1"){
                let code = infos[1];
                let date = infos[2];
                let player_mail = infos[3];
                let player_name = infos[4];
                logText(code, date, player_mail, player_name);
                showText(code, date, player_mail);
            }
            else{
                let code = infos[1];
                let date = infos[2];
                let x = infos[3];
                let y = infos[4];
                let is_img = infos[5];
                showEmoji(code, date, is_img, x, y);
            }
        }
    }
}

function showEmoji(code, date, is_img=false, x=position_x, y=position_y) {
    //replace code par une img
    var not_in = true;
    for (let elt in emoji_dict){
        if (date == elt){
            not_in=false;
        }
    }
    if (not_in){
        if (is_img == true || is_img == "True"){
            document.getElementById("emoji_manager").insertAdjacentHTML('beforeend',"<img src='"+code+"' id='emoji_"+date+"'class='emoji_show' style='width:60px;height:60px;border-radius: 10px;border: 1px solid rgba(48, 48, 48, 0.922);'>");
            document.getElementById("emoji_"+date).style.position = "absolute";
            document.getElementById("emoji_"+date).style.left = x+"px";
            document.getElementById("emoji_"+date).style.top = y+"px";
            document.getElementById("emoji_"+date).style.animation = "emoji_fade 3s linear forwards";
            
            emoji_dict[date]=(["emoji_"+date]);
        }
        else {
            document.getElementById("emoji_manager").insertAdjacentHTML('beforeend',"<div id='emoji_"+date+"'class='emoji_show'>"+code+"</div>");
            document.getElementById("emoji_"+date).style.position = "absolute";
            document.getElementById("emoji_"+date).style.left = x+"px";
            document.getElementById("emoji_"+date).style.top = y+"px";
            document.getElementById("emoji_"+date).style.animation = "emoji_fade 3s linear forwards";
            
            emoji_dict[date]=(["emoji_"+date]);
        }
    }
}

function removeEmojis() {
    var emoji_to_keep = {};
    for (let elt in emoji_dict){
        if (Date.now()-elt>=3000){
            let code = document.getElementById(emoji_dict[elt]);
            if (code) {
                code.remove();
            }
        }
        else{
            emoji_to_keep[elt] = emoji_dict[elt];
        }
    }
    emoji_dict=emoji_to_keep;
}


//image part

function selectImage() {
    get_File()
}
async function get_File() {
    // open file picker, destructure the one element returned array
    [imgHandle] = await window.showOpenFilePicker(pickerImageOpts);
    publishImg();
}
async function publishImg() {
    const file = await imgHandle.getFile();
    console.log("Uploading:", file);
    if (!file) {
        alert("Please select a file first!");
        return;
    }

    const formData = new FormData();
    formData.append("image", file);

    const IMGUR_CLIENT_ID = "3b2d954b1608ae6"; // please don't look uwu
    try {
        const res = await fetch("https://api.imgur.com/3/image", {
            method: "POST",
            headers: {
                Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
            },
            body: formData
        });

        const data = await res.json();
        if (data.success) {
            document.getElementById("image_to_swap").src = data.data.link;
            imgName=data.data.link;
            console.log("Uploaded:", data.data.link);
        } else {
            throw new Error(data.data.error);
        }
    } catch (err) {
        console.error("Upload failed:", err.message);
        alert("Imgur upload failed: " + err.message);
    }
}

//Chat

function sendMessage(){
    var code = document.getElementById("chat_bar").value;
    if (code.length >= max_caracters){
        alert("Too much caracters, please shorten your sentence");
    }
    else{
        showText(code, Date.now(), mail, true);
        //send to the server the emoji
        webSocket.addText({code:code, date:Date.now(), player_mail:mail, player_name:name_pseudo});
    }
    document.getElementById("chat_bar").value="";
}

function removeText() {
    var text_to_keep = {};
    for (let elt in text_dict){
        if (Date.now()-elt>=3000+(document.getElementById(text_dict[elt]).innerHTML.length/(max_caracters*0.15))){
            for (let _elt in link_player_msg){
                if (link_player_msg[_elt][1] == text_dict[elt]){
                    delete link_player_msg[_elt];
                }
            }
            let code = document.getElementById(text_dict[elt]);
            if (code) {
                code.remove();
            }
        }
        else{
            text_to_keep[elt] = text_dict[elt];
        }
    }
    text_dict=text_to_keep;
}

function showText(code, date, player_mail, show_abs=false) {
    //replace code par un text
    var not_in = true;
    for (let elt in text_dict){
        if (date == elt){
            not_in=false;
        }
    }
    if (not_in){
        if (mail == player_mail){
            if (show_abs){
                document.getElementById("text_manager").insertAdjacentHTML('beforeend',"<div id='text_"+date+"' class='text_show' style='font-size:"+10*(((max_caracters)*0.04)/((code.length+1)*0.04))+"'>"+code+"</div>");
                document.getElementById("text_"+date).style.position = "absolute";
                document.getElementById("text_"+date).style.left = (position_x+3)+"px";
                document.getElementById("text_"+date).style.top = (position_y-30).toString()+"px";
                document.getElementById("text_"+date).style.animation = "text_fade "+((code.length/(max_caracters*0.15))+1.5).toString()+"s linear forwards";
                
                text_dict[date]=(["text_"+date]);
                link_player_msg.push([mail, ("text_"+date).toString()])
            }
        }
        else {
            let player = document.getElementById(player_mail);
            document.getElementById("text_manager").insertAdjacentHTML('beforeend',"<div id='text_"+date+"' class='text_show' style='font-size:"+10*(((max_caracters)*0.04)/((code.length+1)*0.04))+"'>"+code+"</div>");
            document.getElementById("text_"+date).style.position = "absolute";
            document.getElementById("text_"+date).style.left = (player.style.left+3)+"px";
            document.getElementById("text_"+date).style.top = (player.style.top-30).toString()+"px";
            document.getElementById("text_"+date).style.animation = "text_fade "+((code.length/(max_caracters*0.15))+1.5).toString()+"s linear forwards";
            
            text_dict[date]=(["text_"+date]);
            link_player_msg.push([player_mail, ("text_"+date).toString()]);
        }
    }
}

function logText(text, date, p_mail, p_name){
    var add = false;
    if (document.getElementById(p_mail+date)==undefined){
        add=true;
    }
    if (add==true){
        const then = new Date(parseInt(date));
        let str_date=then.toUTCString();

        if (mail == p_mail){
            document.getElementById("chat_log").insertAdjacentHTML('beforeend',"<p id='"+(p_mail+date)+"'>"+"<span class='log_name'>> You : </span>"+text+"<span class='log_date'> ("+str_date+")</span>"+"</p>");
        }
        else {
            document.getElementById("chat_log").insertAdjacentHTML('beforeend',"<p id='"+(p_mail+date)+"'>"+"<span class='log_name'>> "+p_name+" : </span>"+text+"<span class='log_date'> ("+str_date+")</span>"+"</p>");
        }
        let chat = document.getElementById('chat_log');
        chat.scrollTop = chat.scrollHeight;
    }
}

window.joinServer = joinServer;
window.add_friend = add_friend;
window.remove_friend = remove_friend;
window.see_profile = see_profile;
window.logOut = logOut;
window.setProfileShow = setProfileShow;
window.setProfileModifie = setProfileModifie;
window.openProfile = openProfile;
window.sendMail = sendMail;
window.passwordShow = passwordShow;
window.submitLogin = submitLogin;
window.setNewPassword = setNewPassword;
window.submitRegister = submitRegister;
window.addEmoji = addEmoji;
window.selectImage = selectImage;
window.sendMessage = sendMessage;