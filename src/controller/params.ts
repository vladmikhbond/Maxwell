import Charge from "../models/Charge";
import Wire from "../models/Wire";

export function getParams(elementId: string)
{
    const paramsElement = <HTMLInputElement>document.getElementById(elementId);
    try {
        return (new Function("", 
            `return {${paramsElement.value}};`
        ))();
    } catch {
        return errMesage("Grammar error", paramsElement);
    }
}

function errMesage(mes: string, el: HTMLInputElement) {
    alert (mes);
    el.style.backgroundColor = "pink";
    return null;
}

//------------------------------------------------------------------

const chargeParams = (document.getElementById("chargeParams") as HTMLInputElement)!;
const wireParams = (document.getElementById("wireParams") as HTMLInputElement)!;

export function setChargeParams(ch: Charge) {
    chargeParams.value = 
       `q: ${ch.q}, vx: ${ch.v[0].toFixed(1)}, vy: ${ch.v[1].toFixed(1)}, m: ${ch.m}, fixed: ${ch.fixed ? 1 : 0}`;
}

export function setWireParams(wire: Wire) {
    wireParams.value = `x: ${wire.x}, j: ${wire.j}`;
}
