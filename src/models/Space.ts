import { glo, doc } from "../globals.js"; 
import Charge from "./Charge.js";
import { vec2 } from 'gl-matrix';
import Wire from "./Wire.js";

// AxB = Ax*By - Ay*Bx
export const cross2 = (a: vec2, b: vec2) => a[0] * b[1] - a[1] * b[0];

export default class Space 
{

    height = doc.canvas.height;
    width = doc.canvas.width;
    charges: Charge[] = []
    wires: Wire[] = []
    steadyMagnetic = 0                  // 0.01


    private electricFieldScratch = vec2.create();
    private chargeFieldScratch = vec2.create();


    selectedCharge: Charge | null = null;
    selectedWire: Wire | null = null;

    constructor() { }
   
    step() {
        for (let ch of this.charges) {
            if (ch.fixed) 
                continue;

            const q$m = ch.q / ch.m;

            if (glo.isE) {
                const E = this.EatR(ch.r, this.electricFieldScratch);
                // прискор від сили Кулона
                const scale = glo.eps0 * q$m;
                ch.v[0] += E[0] * scale;
                ch.v[1] += E[1] * scale;
            }            
 
            if (glo.isB) {
                const Bz = this.BatR(ch.r);
                // прискор від сили Лоренца
                const bqm = Bz * q$m;
                const vx = ch.v[0];
                const vy = ch.v[1];
                const k = Math.sqrt(1 + bqm * bqm);
                ch.v[0] = (vx + vy * bqm) / k;
                ch.v[1] = (vy - vx * bqm) / k;
            }
             
            // coordinates
            vec2.add(ch.r, ch.r, ch.v);

        }
    }
    
    // Підраховує сумарну напруженість електричного поля в точці r
    EatR(r: vec2, out: vec2 = vec2.create()): vec2 {
        out[0] = 0;
        out[1] = 0;
        for (let c of this.charges) {
            const field = c.EatR(r, this.chargeFieldScratch);
            out[0] += field[0];
            out[1] += field[1];
        }
        return out;
    }

    // Підраховує сумарну напруженість магнітного поля Bz в точці r
    BatR(r: vec2): number {
        // стала напруга
        let sum = this.steadyMagnetic;
        
        // від рухомих зарядів
        for (let ch of this.charges) {
            sum += ch.BatR(r);
        }

        // від провідників
        for (let wi of this.wires) {
            sum += wi.BatR(r);
        }
        // console.log(sum)
        return sum;
    }

// ---------------------- SEL Charge

    trySelectCharge(x: number, y: number): boolean {
        this.selectedCharge = null;
        for (let ch of this.charges) {
            if (ch.isInside(vec2.fromValues(x, y))) {
                this.selectedCharge = ch;
                return true;
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

// ---------------------- SEL Wire

    trySelectWire(x: number): boolean {
        this.selectedWire = null;
        for (let wi of this.wires) {
            if (Math.abs(wi.x - x) < 3) {
                this.selectedWire = wi;
                return true;
            }
        }
        return false;
    }

    removeSelectedWire() {
        if (! this.selectedWire)
            return;
        let idx = this.wires.indexOf(this.selectedWire);
        this.wires.splice(idx, 1);
        this.selectedWire = null;
    }


}


