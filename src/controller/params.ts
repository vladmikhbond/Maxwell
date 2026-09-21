import Charge from "../models/Charge";

type N2 = [number, number];
type N5 = [number, number, number, number, number];

const sizeParams = (document.getElementById("sizeParams") as HTMLInputElement)!;
const chargeParams = (document.getElementById("chargeParams") as HTMLInputElement)!;

export function getSizeParams(): N2 | null
{
    let params: N2;
    try {
        params = (new Function("", 
            "let W, H;" + 
            sizeParams.value + 
            "; return [W, H]" 
        ))();
    } catch {
        return errMesage("Grammar error", sizeParams);
    }
    // перевірки
    if (params[0] == undefined || params[0] <= 0) 
        return errMesage("W: W > 0", sizeParams);

    if (params[1] == undefined || params[1] <= 0) 
        return errMesage("H: H > 0", sizeParams);

    sizeParams.style.backgroundColor = "";
    return params;
}

export function getChargeParams(): N5 | null
{
    let params: N5;
    try {
        params = (new Function("", 
            "let q, vx, vy, m, f;" + 
            chargeParams.value + 
            "; return [q, vx, vy, m, f]" 
        ))();
    } catch {
        return errMesage("Grammar error", chargeParams);
    }
    // перевірки
    // ...

    chargeParams.style.backgroundColor = "";
    return params;
}

export function setChargeParams(ch: Charge) {
    const line = `q=${ch.q}, vx=${ch.v[0].toFixed(1)}, vy=${ch.v[1].toFixed(1)}, m=${ch.m}, f=${ch.fixed ? 1 : 0}`;
    chargeParams.value = line;
}



function errMesage(mes: string, el: HTMLInputElement) {
    alert (mes);
    el.style.backgroundColor = "pink";
    return null;
}
