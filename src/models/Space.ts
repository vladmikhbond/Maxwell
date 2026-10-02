import { glo, doc } from "../globals.js"; 
import Charge from "./Charge.js";
import { vec2 } from 'gl-matrix';

// AxB = Ax*By - Ay*Bx
export const cross2 = (a: vec2, b: vec2) => a[0] * b[1] - a[1] * b[0];

export default class Space 
{

    height = doc.canvas.height;
    width = doc.canvas.width;
    charges: Charge[] = []
    steadyMagnetic = 0.01


    selectedCharge: Charge | null = null;

    constructor() { }
   
    step() {
        for (let ch of this.charges) {
            if (ch.fixed) 
                continue;

            let E = this.EatR(ch.r);
            let Bz = this.BatR(ch.r);

            // velocity
            let q$m = ch.q / ch.m;

            if (glo.isE) {
                // прискор від сили Кулона
                let accE = vec2.scale(vec2.create(), E,  glo.eps0 * q$m);
                vec2.add(ch.v, ch.v, accE);
            }            
 

            if (glo.isB) {
                // прискор від сили Лоренца
                let accB = vec2.fromValues(ch.v[1] * Bz * q$m, -ch.v[0] * Bz * q$m);            
                vec2.add(ch.v, ch.v, accB);
            }
             
            // coordinates
            vec2.add(ch.r, ch.r, ch.v);

        }
    }
    
    // Підраховує сумарну напруженість електричного поля в точці r
    EatR(r: vec2): vec2 {
        let sum: vec2 = vec2.fromValues(0, 0);
        for (let c of this.charges) {
            vec2.add(sum, sum, c.EatR(r));
        }
        return sum;
    }

    // Підраховує сумарну напруженість магнітного поля Bz в точці r
    BatR(r: vec2): number {
        let sum = this.steadyMagnetic;
        for (let ch of this.charges) {
            sum += ch.BatR(r);
        }
        // console.log(sum)
        return sum;
    }

///// SEL

    trySelectCharge(x: number, y: number): boolean {
        this.selectedCharge = null;
        for (let ch of this.charges) {
            if (ch.isInside(vec2.fromValues(x, y))) {
                this.selectedCharge = ch;
                return true;
                break;
            }
        }
        return false;
    }

    removeSelectedCharge() {
        if (! this.selectedCharge)
            return;
        let idx = this.charges.indexOf(this.selectedCharge);
        this.charges.splice(idx, 1);
        this.selectedCharge = null;
    }




}


