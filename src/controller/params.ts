import Charge from "../models/Charge";


const infoParams = (document.getElementById("infoParams") as HTMLInputElement)!;
const chargeParams = (document.getElementById("chargeParams") as HTMLInputElement)!;

export function getInfoParams()
{
    try {
        return (new Function("", 
            `return {${infoParams.value}};`
        ))();
    } catch {
        return errMesage("Grammar error", infoParams);
    }
}

export function getChargeParams()
{
    try {
        return (new Function("", 
            `return {${chargeParams.value}};`
        ))();
    } catch {
        return errMesage("Grammar error", chargeParams);
    }
}

export function setChargeParams(ch: Charge) {
    const line = `q: ${ch.q}, vx: ${ch.v[0].toFixed(1)}, vy: ${ch.v[1].toFixed(1)}, m: ${ch.m}, fixed: ${ch.fixed ? 1 : 0}`;
    chargeParams.value = line;
}



function errMesage(mes: string, el: HTMLInputElement) {
    alert (mes);
    el.style.backgroundColor = "pink";
    return null;
}
