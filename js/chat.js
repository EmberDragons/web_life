//Chat

export function sendMessage(){
    var code = document.getElementById("chat_bar").value;
    if (code.length >= max_caracters){
        alert("Too much caracters, please shorten your sentence");
    }
    else{
        showText(code, Date.now(), mail, show_abs=true);
        //send to the server the emoji
        fetch('http://localhost:5000/addTextList', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code:code, date:Date.now(), player_mail:mail, player_name:name_pseudo})
        })
        .then(response => response.json())
        .then(data => {
            
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
    document.getElementById("chat_bar").value="";
}

export function removeText() {
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

export function showText(code, date, player_mail, show_abs=false) {
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

export function logText(text, date, p_mail, p_name){
    var add = false;
    if (document.getElementById(p_mail+date)==undefined){
        add=true;
    }
    if (add==true){
        const then = new Date(parseInt(date));
        let str_date=then.toUTCString();

        if (mail == p_mail){
            document.getElementById("chat_log").insertAdjacentHTML('beforeend',"<p id='"+(p_mail+date)+"'>"+"<span class='log_name'>> You : </span>"+text+"<span class='log_date'>("+str_date+")</span>"+"</p>");
        }
        else {
            document.getElementById("chat_log").insertAdjacentHTML('beforeend',"<p id='"+(p_mail+date)+"'>"+"<span class='log_name'>> "+p_name+" : </span>"+text+"<span class='log_date'>("+str_date+")</span>"+"</p>");
        }
        let chat = document.getElementById('chat_log');
        chat.scrollTop = chat.scrollHeight;
    }
}