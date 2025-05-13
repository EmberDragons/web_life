var password_state = false;

var infos;

var name_pseudo;
var mail;
var password;
var server_id;
var position;
var id_password;


//cookies XD

function retrieveInfos() {
    id_password=document.cookie.replace("id_password=","").replace(";","");
    if (!id_password) {
        console.error("id_password cookie not found");
        return;
    }
    communicate_get();
}


//setInterval(function(){communicate()},1000);


window.addEventListener("load", (event) => {
    if (document.cookie != ""){
        retrieveInfos();
    }
    else{
        setLogin();
    }
});


function logOut() {
    document.cookie="id_password = ''; expires=Thu, 03 Aug 2008 12:00:00 UTC; path=/";
    open('login.html',"_self");
}


function setProfile() {
    document.getElementById("profile").innerHTML="<img src='https://icons.hackclub.com/api/icons/white/profile-fill' style='position: relative; top:4px; height:22px; overflow: hidden;'>"+name_pseudo;
    if (document.getElementById("profile_name")!=null){
        document.getElementById("profile_name").innerHTML=name_pseudo;
    }
    if (document.getElementById("profile_mail")!=null){
        document.getElementById("profile_mail").innerHTML=mail;
    }
    if (document.getElementById("profile_server")!=null){
        document.getElementById("profile_server").innerHTML="Server "+server_id;
    }
}
function setLogin() {
    document.getElementById("profile").innerHTML="<img src='https://icons.hackclub.com/api/icons/white/profile-fill' style='position: relative; top:4px; height:22px; overflow: hidden;'>"+"Log In";
}

function setProfileShow(event) {
    event.preventDefault();
    if (document.getElementById("profile_name")!= null && document.getElementById("profile_password")!=null){
        let p_name = document.getElementById("profile_name").value;
        let pass = document.getElementById("profile_password").value;

        //set the new name and password
        //send to the database the mail and password to check if it connects
        fetch('http://localhost:5000/updateProfile', {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name : p_name, password : pass, id : id_password})
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
        ("<img src='https://icons.hackclub.com/api/icons/grey/profile-fill' style='position:absolute; left: 35px; top:38px; width:60px'> "
        +"<h2 class='profile_name' id='profile_name'> "+name_pseudo+" </h2>"
        +"<button class='profile_button' onclick='setProfileModifie()'> <img class='profile_name_image' src='https://icons.hackclub.com/api/icons/white/edit' style='width:45px;'></button> "
        +"<p class='profile_mail' id='profile_mail'> "+ mail +" </p>"
        +"<p class='profile_server' id='profile_server'> Server "+server_id+" </p>"
        +"<button class='log_out_button' onclick='logOut()'> <img class='log_out_image' src='https://icons.hackclub.com/api/icons/white/door-leave' style='width:45px;'></button> ");

}

function setProfileModifie() {

    document.getElementById("modifie_profile").innerHTML=
        ("<img src='https://icons.hackclub.com/api/icons/grey/profile-fill' style='position:absolute; left: 35px; top:38px; width:60px'> "
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
                position = (infos[4],infos[5]);
                setProfile();
                setProfileShow();
            }

        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}
