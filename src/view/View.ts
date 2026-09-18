import { Space } from "../models/Space.js";
import { glo, doc } from "../globals.js"; 
import { vec2 } from "gl-matrix";
import Charge from "../models/Charge.js";

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

        for (let ch of this.space.charges) {

            this.drawSign(ch);

            // Electric field strength
            if (glo.isE) {
                let radius = ch.blindRadius;
                let n = 6 * Math.sqrt(Math.abs(ch.q)) | 0;

                for (let ro = 0; ro < 2 * Math.PI; ro += Math.PI / n) {
                    let r = vec2.fromValues(radius * Math.cos(ro), radius * Math.sin(ro));
                    let r1 = vec2.create();
                    vec2.add(r1, r, ch.r);
                    this.drawLine(r1, ch);
                }
            }


            // Track
            if (this.isTrack) {
                this.ctx2.fillRect(ch.r[0] - 0.5, ch.r[1] - 0.5, 1, 1);
            }
        }

    }

    drawB() {
        const d = 8;
        const ctx = this.ctx;

        // Bmax
        let bs = this.space.charges.map(ch => {
            let p = vec2.fromValues(ch.r[0] - 5, ch.r[1]);
            return Math.abs(ch.BatR(p));
        })
 
        const Bmax = Math.max(...bs) / 100

        for (let x = 0; x < this.space.width; x += d) {
            for (let y = 0; y < this.space.height; y += d)  {

                let p = vec2.fromValues(x + d/2, y + d/2)
                let B = this.space.BatR(p);
                let deep = 255 * (1 - Math.abs(B) / Bmax);
                if (deep > 255) deep = 255
                if (B < 0) {
                    ctx.fillStyle = `rgb(${deep} 255 255 / 50%)`;                    
                } else {
                    ctx.fillStyle = `rgb(255 255 ${deep} / 50%)`;  
                }
                ctx.fillRect(x, y, d, d);
            }
        }

        
    }




    drawSign(ch: Charge) {
        const d = 1
        if (ch.q < 0) {
            this.ctx.fillStyle = "blue";
            this.ctx.fillRect(ch.r[0]-4*d, ch.r[1]-d, 8*d, 2*d); // hor
        } else {
            this.ctx.fillStyle = "red";
            this.ctx.fillRect(ch.r[0]-4*d, ch.r[1]-d, 8*d, 2*d); // hor
            this.ctx.fillRect(ch.r[0]-d, ch.r[1]-4*d, 2*d, 8*d); // ver
        }
    }

    
    drawLine(start: vec2, charge: Charge) 
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

}