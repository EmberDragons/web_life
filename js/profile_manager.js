export function GetProfile(mail) {
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

export function logOut() {
    document.cookie="id_password = ''; expires=Thu, 03 Aug 2008 12:00:00 UTC; path=/";
    
    open('login.html',"_self");
}


export function setProfile() {
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

export function setFriendList() {
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

export function setColors() {
    document.getElementById("wrapper").style.borderColor = banner_color;
    document.getElementById('caracter').style.backgroundColor = color;
    document.getElementById('banner').style.backgroundColor = banner_color;
}
export function setLogin() {
    document.getElementById("profile").innerHTML="<img src='https://icons.hackclub.com/api/icons/white/profile-fill' style='position: relative; top:4px; height:22px; overflow: hidden;'>"+"Log In";
}

export function setProfileShow() {
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
        +"<div id='list_friends' style='position:absolute;right:60px;top:180px; width:250px;'><button class='friend_name' onclick='see_profile('none')'> none</button></div>"
        +"<p class='profile_server' id='profile_server'> Server "+server_id+" </p>"
        +"<button class='log_out_button' onclick='logOut()'> <img class='log_out_image' src='https://icons.hackclub.com/api/icons/white/door-leave' style='width:45px;'></button> ");

}

export function setProfileModifie() {

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


export function openProfile() {
    if (!id_password) {
        window.open("login.html","_self");
    }
    else{
        window.open("profile.html","_self");
    }
}

export function sendMail(event){
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

export function passwordShow(event) {
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


export function submitLogin(event) {
    event.preventDefault();
    let mail = document.getElementById('mail_input').value;
    let password = document.getElementById('password_input').value;


    if (mail!=""){
        //send to the database the mail and password to check if it connects
        log_in(mail, password);
    }
}

export function log_in(mail, password){
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

export function setNewPassword(event){
    event.preventDefault();
    let id_password = window.location.search.substring(1).replace("id_password=","");
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
            retrieveInfos();
            setProfile();
            open('profile.html',"_self")
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}


export function submitRegister(event) {
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
            console.log(data.result);
        }

    })
    .catch(error => {
        console.error('Error:', error);
    });
}

export function setColorCararcter() {
    const player_graphics = document.getElementById("player_graphics");
    const player_name = document.getElementById("player_name");
    if (player_graphics!=undefined){
        player_graphics.style.backgroundColor = color;
        player_name.innerHTML = name_pseudo;
    }
}




//friends and strangers
export function add_friend() {
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

export function remove_friend() {
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

export function see_profile(pers_mail) {
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

export function is_friend(mail) {
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

export function setProfileStranger() {
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

export function setProfileFriend() {
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