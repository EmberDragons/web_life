const MODULE = 35;
const ROUND_TO = 100;

export function CodiFiePassword(password){
    let code = "";
    for (let i in password) {
        let n_pass = ((password.charCodeAt(i))**3)*17; // lmao
        let r = module(n_pass, MODULE);
        code=code+r;
    }

    return code;
}

function module(number, param) {
    let t_number = number;
    while (t_number>param) {
        t_number = t_number/2;
    }
    return Math.round(t_number*ROUND_TO)/ROUND_TO; //looks kool
}