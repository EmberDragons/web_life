//PLAY PART

export function handleInput(){
    if (can_move==true){
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
}

export function movePlayer(x, y){
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

export function updatePosPlayer() {
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
export function roundNumber(number, digits) {
    var multiple = Math.pow(10, digits);
    var rndedNum = Math.round(number * multiple) / multiple;
    return rndedNum;
}

export function checkForOutOfBounds(pos_x, pos_y) {
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