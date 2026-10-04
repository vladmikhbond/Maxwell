import Charge from "../models/Charge";
import Wire from "../models/Wire";

const infoParams = (document.getElementById("infoParams") as HTMLInputElement)!;
const chargeParams = (document.getElementById("chargeParams") as HTMLInputElement)!;
const wireParams = (document.getElementById("wireParams") as HTMLInputElement)!;

//-----------------------------InfoParams-------------------------------------

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

//--------------------------------ChargeParams----------------------------------

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

//-----------------------------WireParams-------------------------------------

export function getWireParams()
{
    try {
        return (new Function("", 
            `return {${wireParams.value}};`
        ))();
    } catch {
        return errMesage("Grammar error", wireParams);
    }
}

export function setWireParams(wire: Wire) {
    wireParams.value = `, x: ${wire.x}, j: ${wire.j}`;
}


//------------------------------------------------------------------

function errMesage(mes: string, el: HTMLInputElement) {
    alert (mes);
    el.style.backgroundColor = "pink";
    return null;
}
