import Space from "../models/Space.js";
import { glo, doc } from "../globals.js"; 
import { vec2 } from "gl-matrix";
import Charge from "../models/Charge.js";
import { getChargeParams } from "../controller/params.js";

export default class View {

    space: Space

    ctx: CanvasRenderingContext2D
    ctx2: CanvasRenderingContext2D

    Bmax = 0   // макс напруж магнітного поля
    Emin = 0   // мін напруж електричного поля

    constructor(space: Space) {
        this.space = space;
        this.ctx = doc.canvas.getContext("2d")!;
        this.ctx2 = doc.canvas2.getContext("2d")!;   
    }

    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.space.width, this.space.height);

        // Magnetic field strength
        if (glo.isB) {
            this.drawB();
        }
        // Electric field strength
        if (glo.isE) {
            this.drawE();
        }
        // Nucleus of the charges and tracks
        for (let ch of this.space.charges) {
            this.drawCharge(ch);
            // Track
            if (glo.isTracing) {
                this.ctx2.fillRect(ch.r[0] - 0.5, ch.r[1] - 0.5, 1, 1);
            }
        }

    }

    // Draws magnetic field in the whole space.
    //
    drawB() {
        const dx = 8;
        const ctx = this.ctx;

        for (let x = 0; x < this.space.width; x += dx) {
            for (let y = 0; y < this.space.height; y += dx)  {

                let p = vec2.fromValues(x + dx/2, y + dx/2)
                let B = this.space.BatR(p);
                let deep = 255 * (1 - Math.abs(B) / this.Bmax);
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
    
    // Draws electric field in the whole space.
    drawE() {
        for (let ch of this.space.charges) {
            let radius = ch.blindRadius;
            let n = rayCount(ch);
            for (let i = 0; i < n; i++) {
                let angle = 2 * Math.PI * i / n;
                let r = vec2.fromValues(radius * Math.cos(angle), radius * Math.sin(angle));
                let start = vec2.add(vec2.create(), r, ch.r);
                this.drawRay(start, ch);
            }
        }
    }
    
    // Draw one charge as a white circle with a sign inside.
    //
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

    
    drawRay(start: vec2, charge: Charge) 
    {
        const K = 0.5;     // коеф. довжини сегменту ломаної
        const MAX_E = 0.05;  // макс напруж електричного поля
        const N_SEG = 1000; // макс кількість сегментів лінії поля
         
        const sign =  Math.sign(charge.q);
        const position = vec2.clone(start);

        // Color
        this.ctx.strokeStyle = "rgb(0 0 255 / 50%)" ;
        let seg_count = 0;

        this.ctx.beginPath();
        while (seg_count < N_SEG) {
            const E = this.space.EatR(position);
            const magnitude = vec2.length(E);

            if (magnitude < this.Emin)
                break;

            seg_count++;
    
            // continue to draw the ray  
            const dx = sign * E[0] * K / magnitude;
            const dy = sign * E[1] * K / magnitude;
            this.ctx.moveTo(position[0], position[1]);
            this.ctx.lineTo(position[0] + dx, position[1] + dy);
            position[0] += dx;
            position[1] += dy;

            const magnitude1 = vec2.length(this.space.EatR(position));
            if (magnitude1 > magnitude)
                break;


        } 
        this.ctx.stroke();

    }


    //#region Gray Zone
    
    drawGrayArc(x0: number, y0: number, x: number, y: number,) {
        const ctx = this.ctx;
        ctx.lineWidth = 1;
        ctx.strokeStyle = ctx.fillStyle = 'gray';

        let params = getChargeParams()!;

        let radius =  Math.sqrt(Math.abs(params.q)) * 5
        
        ctx.beginPath();        
        ctx.arc(x0, y0, radius, 0, Math.PI*2);
        ctx.moveTo(x0, y0);
        ctx.lineTo(x, y);
        ctx.stroke();
    }

    drawGrayVerLine(x: number) {
        const ctx = this.ctx;
        ctx.lineWidth = 1;
        ctx.strokeStyle = ctx.fillStyle = 'gray';

        ctx.beginPath();        
        ctx.moveTo(x, 0);
        ctx.lineTo(x, doc.canvas.height);
        ctx.stroke();        
    }

    //#endregion Gray Zone    
}


function rayCount(ch: Charge) {
    const RAY_COUNT = 12;
    return Math.abs(ch.q * RAY_COUNT) | 0;
}

