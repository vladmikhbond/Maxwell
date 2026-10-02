import { vec2 } from 'gl-matrix';
import { glo } from "../globals.js";

export default class Wire {
    x = 0
    j = 0

    constructor(x: number, j: number) {
        this.x = x;
        this.j = j;
    }

    // Напруженість магнітного поля, яку створює провідник в точці r
    BatR(r: vec2): number 
    {
        const radius = r[0] - this.x;          
        // близько до провіднику поля нема 
        if (Math.abs(radius) < 5) {    //TODO
            return 0;
        } 
        // Bz
        const Bz = glo.Ke * 2 * this.j / (glo.C * glo.C *radius);
        return Bz;
    }
    
}