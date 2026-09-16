import { glo, doc } from "../globals.js"; 
import Charge from "./Charge.js";
import { vec2 } from 'gl-matrix';

export class Space {
    height = doc.canvas.height;
    width = doc.canvas.width;
    charges: Charge[] = []


    
    constructor() { }

    step() {
        for (let ch of this.charges) {
            if (ch.fixed) 
                continue;
            // acceleration
            let e = this.EatR(ch.r);
            let b = this.BatR(ch.r);
            
            // прискор від сили Кулона
            let ae = vec2.scale(vec2.create(), e,  glo.eps0 * ch.q / ch.m);
            // прискор від сили Лоренца
            let vXb = vec2.mul(vec2.create(), ch.v, b)
            let ab = vec2.scale(vec2.create(), vXb,  ch.q / ch.m);
            let a = vec2.add(vec2.create(), ae, ab);

            // velocity 
            ch.v[0] += ab[0];
            ch.v[1] += ab[1];

            // coordinates
            vec2.add(ch.r, ch.r, ch.v);
        }

            let r = this.charges[1].r
            // console.log (this.BatR(r))
    }
    
    // Підраховує сумарну напруженість електричного поля в точці r
    EatR(r: vec2): vec2 {
        let sum: vec2 = vec2.fromValues(0, 0);
        for (let c of this.charges) {
            vec2.add(sum, sum, c.EatR(r));
        }
        return sum;
    }

    // Підраховує сумарну напруженість магнітного поля в точці r
    BatR(r: vec2): vec2 {
        let sum: vec2 = vec2.fromValues(0, 0);
        for (let c of this.charges) {
            vec2.add(sum, sum, c.BatR(r));
        }
        return sum;
    }








}


