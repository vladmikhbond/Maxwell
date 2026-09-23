import Space from "../models/Space.js";
import { glo, doc } from "../globals.js"; 
import { vec2 } from "gl-matrix";
import Charge from "../models/Charge.js";
import { getChargeParams } from "../controller/params.js";

export default class View {
    space: Space

    ctx: CanvasRenderingContext2D
    ctx2: CanvasRenderingContext2D

    constructor(space: Space) {
        this.space = space;
        this.ctx = doc.canvas.getContext("2d")!;
        this.ctx2 = doc.canvas2.getContext("2d")!;
    }

    get isTrack(): boolean {
        return (<HTMLInputElement>document.getElementById("traceModeCheckbox")).checked;
    }


    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.space.width, this.space.height);

        // Magnetic field strength
        if (glo.isB) {
            this.drawB();
        }

        // Electric fields of the charges
        for (let ch of this.space.charges) {

            // Electric field strength
            if (glo.isE) {
                let radius = ch.blindRadius;
                let n = 6 * Math.sqrt(Math.abs(ch.q)) | 0;

                for (let ro = 0; ro < 2 * Math.PI; ro += Math.PI / n) {
                    let r = vec2.fromValues(radius * Math.cos(ro), radius * Math.sin(ro));
                    let r1 = vec2.create();
                    vec2.add(r1, r, ch.r);
                    this.drawElectricLine(r1, ch);
                }
            }
        }

        // Nucleus of the charges and tracks
        for (let ch of this.space.charges) {
            this.drawCharge(ch);
            // Track
            if (this.isTrack) {
                this.ctx2.fillRect(ch.r[0] - 0.5, ch.r[1] - 0.5, 1, 1);
            }
        }

    }

    drawB() {
        const dx = 8;
        const ctx = this.ctx;

        // Bmax
        let bs = this.space.charges.map(ch => {
            let p = vec2.fromValues(ch.r[0] - 5, ch.r[1]);
            return Math.abs(ch.BatR(p));
        })
 
        const Bmax = Math.max(...bs) / 100;
        // No B at all
        if (Bmax == 0) {
            return;
        }

        for (let x = 0; x < this.space.width; x += dx) {
            for (let y = 0; y < this.space.height; y += dx)  {

                let p = vec2.fromValues(x + dx/2, y + dx/2)
                let B = this.space.BatR(p);
                let deep = 255 * (1 - Math.abs(B) / Bmax);
                if (deep > 255) deep = 255
                if (B < 0) {
                    ctx.fillStyle = `rgb(${deep} 255 255 / 50%)`;                    
                } else {
                    ctx.fillStyle = `rgb(255 255 ${deep} / 50%)`;  
                }
                ctx.fillRect(x, y, dx, dx);
            }
        }

        
    }

    drawCharge(ch: Charge) {
        let d = 1;
        if (ch === this.space.selectedCharge) {
            d = 2;
        }
        const ctx = this.ctx;

        ctx.fillStyle = "white";
        ctx.beginPath()
        ctx.arc(ch.r[0], ch.r[1], ch.blindRadius, 0, 2* Math.PI)
        ctx.fill();

        if (ch.q < 0) {
            // minus
            ctx.fillStyle = "blue";
            ctx.fillRect(ch.r[0]-4*d, ch.r[1]-d, 8*d, 2*d); // hor
        } else {
            // plus
            ctx.fillStyle = "red";
            ctx.fillRect(ch.r[0]-4*d, ch.r[1]-d, 8*d, 2*d); // hor
            ctx.fillRect(ch.r[0]-d, ch.r[1]-4*d, 2*d, 8*d); // ver
        }
    }

    
    drawElectricLine(start: vec2, charge: Charge) 
    {
        let unit = Math.sign(charge.q);
        this.ctx.strokeStyle = charge.q < 0 ? "rgb(0 0 255 / 50%)" : "rgb(255 0 0 / 50%)";
        this.ctx.beginPath();
        
        while (vec2.len(this.space.EatR(start)) > 0.5) 
        {
            if (vec2.len(this.space.EatR(start)) > 50) break

            let e = this.space.EatR(start);
            vec2.len(e)

            let abs_e = vec2.create(); vec2.scale(abs_e, e, unit);

            let finish = vec2.add(vec2.create(), start, abs_e);
            this.ctx.moveTo(start[0], start[1])
            this.ctx.lineTo(finish[0], finish[1]);
            start = finish;

        } 

        this.ctx.stroke();
        this.ctx.restore(); 
    }


    //#region Gray Zone
    
    drawGrayArc(x0: number, y0: number, x: number, y: number,) {
        const ctx = this.ctx;
        ctx.lineWidth = 1;
        ctx.strokeStyle = ctx.fillStyle = 'gray';

        let params = getChargeParams()!;

        let radius =  Math.sqrt(Math.abs(params[0])) * 5
        
        ctx.beginPath();        
        ctx.arc(x0, y0, radius, 0, Math.PI*2);
        ctx.moveTo(x0, y0);
        ctx.lineTo(x, y);
        ctx.stroke();
    }

    //#endregion Gray Zone
}