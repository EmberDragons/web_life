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

function setProfile() {
    document.getElementById("profile").innerHTML="<img src='https://icons.hackclub.com/api/icons/white/profile-fill' style='position: relative; top:4px; height:22px; overflow: hidden;'>"+name_pseudo;
}
function setLogin() {
    document.getElementById("profile").innerHTML="<img src='https://icons.hackclub.com/api/icons/white/profile-fill' style='position: relative; top:4px; height:22px; overflow: hidden;'>"+"Log In";
}

function passwordShow() {
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

function submitLogin() {
    let mail = document.getElementById('mail_input').value;
    let password = document.getElementById('password_input').value;


    //send to the database the mail and password to check if it connects
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
            alert(document.cookie);
            retrieveInfos();
            setProfile();
            open('profile.html')
        }

    })
    .catch(error => {
        console.error('Error:', error);
    });

}


function submitRegister() {
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
        if (data.result == "Error-already_in_database"){
            alert("email already used");
            console.error(data.result);
        }
        else{
            open("login.html");
            console.log(data.result);
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
                console.log(str_res);
                name_pseudo = infos[0];
                mail = infos[1];
                password = infos[2];
                server_id = infos[3];
                position = (infos[4],infos[5]);
                setProfile();
            }

        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}
