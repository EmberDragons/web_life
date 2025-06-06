// multiplayer emojis

export function addEmoji(nb) {
    if (wait_next_date == undefined || Date.now()-wait_next_date>=2000){
        if (nb!=6){
            wait_next_date=Date.now();
            var code = document.getElementById(nb).innerHTML;
            showEmoji(code, Date.now(), is_img=false);
            //send to the server the emoji
            fetch('http://localhost:5000/addEmojiList', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ code:code, date:wait_next_date, pos_x:position_x, pos_y:position_y, is_img:false})
            })
            .then(response => response.json())
            .then(data => {
                
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
        else {
            if (imgName!=undefined){
                wait_next_date=Date.now();
                var link = imgName;
                showEmoji(link, Date.now(), is_img=true);
                //send to the server the emoji
                fetch('http://localhost:5000/addEmojiList', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ code : link, date:wait_next_date, pos_x:position_x, pos_y:position_y, is_img:true})
                })
                .then(response => response.json())
                .then(data => {
                    
                })
                .catch(error => {
                    console.error('Error:', error);
                });
            }
        }
    }
}


export function getObjects() {
    //send to the server the emoji
    fetch('http://localhost:5000/getObjectList', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    })
    .then(response => response.json())
    .then(data => { 
        if (data.result != ""){
            var all_elts = data.result.split("|");
            for (let elt in all_elts){
                if (all_elts[elt] != ''){
                    let infos = all_elts[elt].split(',');
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
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

export function showEmoji(code, date, is_img=false, x=position_x, y=position_y) {
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

export function removeEmojis() {
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

export function selectImage() {
    get_File()
}

export async function get_File() {
    // open file picker, destructure the one element returned array
    [imgHandle] = await window.showOpenFilePicker(pickerImageOpts);
    publishImg();
}

export async function publishImg() {
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
                Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
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
