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

        for (let ch of this.space.charges) {
            // Magnetic field strength
            if (glo.isB) {
                this.drawB(ch.r);
            }

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

    drawB(r: vec2) {
        const Rmax = 1000
        const ctx = this.ctx;
        ctx.beginPath();          
        for (let rad = 10; rad < Rmax; rad += 10) {
            for (let angl = 0; angl < 2 * Math.PI; angl += Math.PI / 6) {
                let t = vec2.fromValues(rad * Math.cos(angl), rad * Math.sin(angl))
                
                let p = vec2.add(vec2.create(), r, t)

                let b = this.space.BatR(p);

                if (Math.abs(b) > 1e-5) {
                    ctx.moveTo(p[0] - 1, p[1]);
                    ctx.arc(p[0] - 1, p[1], 1, 0, 2 * Math.PI);
                }
            }
        }
        ctx.stroke();
        
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
        this.ctx.strokeStyle = charge.q < 0 ? "blue" : "red";
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



//#region garbidge
    // drawB(r: vec2) {
    //     const ctx = this.ctx;
    //     let imData = this.ctx.getImageData(0, 0, 100, 100)!;

    //     const color = (x: number, y: number, depth: number, channel: number) => {
    //         const data = imData.data;
    //         let i1 = (y * 100 + x) * 4 + channel;
    //         let i2 = i1 + 4;
    //         let i3 = i1 + 100 * 4;
    //         let i4 = i3 + 4;
    //         data[i1] = data[i2] = data[i3] = data[i4] = depth;
    //     }        

    //     // fill the blue channel
    //     let x1 = r[0] - 50, y1 = r[1] - 50;
        
    //     for (let y = 0; y < 100; y++) {
    //         for (let x = 0; x < 100; x++) {
    //             let r1 = vec2.fromValues(x1 + x, y1 + y) 
    //             let b = this.space.BatR(r1);
    //             let depth = vec2.length(b) * 255000 | 0;
                 
    //             //console.log(y, x, depth)
    //             color(x, y, depth, 2); // blue
    //             let a = depth > 50 ?  128 : 0
    //             color(x, y, a, 3);
    //         }
    //     }
    //     ctx.putImageData(imData, x1, y1);
    // }
//#endregion
}