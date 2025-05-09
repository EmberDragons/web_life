var password_state = false;

var id_password;
var server_id;


var s_mail;
var s_password;

setInterval(function(){communicate()},1000);

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
            alert('Error : Mail or Password incorrect');
            console.error(data.result);
        }
        else{
            id_password = data.result;
            console.log(data.result);
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
            alert("email already used")
            console.error(data.result);
        }
        else{
            s_mail = mail;
            s_password = password;
            open("login.html");
            document.getElementById('mail_input').ariaPlaceholder = s_mail;
            document.getElementById('password_input').ariaPlaceholder = s_password;
            console.log(data.result);
        }

    })
    .catch(error => {
        console.error('Error:', error);
    });
}


function communicate() {
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
                server_id = data.result;
                console.log(data.result);
            }

        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}
