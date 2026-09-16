import { Space } from "../models/Space.js";
import { glo, doc } from "../globals.js"; 
import { vec2 } from "gl-matrix";
import Charge from "../models/Charge.js";

export default class View {
    space: Space
    imData: ImageData
    ctx: CanvasRenderingContext2D
    ctx2: CanvasRenderingContext2D

    constructor(space: Space) {
        this.space = space;
        this.ctx = doc.canvas.getContext("2d")!;
        this.ctx2 = doc.canvas2.getContext("2d")!;
        this.imData = this.ctx.getImageData(0, 0, 100, 100)!;
    }

    get isTrack(): boolean {
        return (<HTMLInputElement>document.getElementById("traceModeCheckbox")).checked;
    }

    get isHair(): boolean {
        return (<HTMLInputElement>document.getElementById("hairModeCheckbox")).checked;
    }

    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.space.width, this.space.height);

        for (let ch of this.space.charges) {
            this.drawSign(ch);

            // Electric field strength
            if (this.isHair) {
                let radius = ch.blindRadius;
                let n = 6 * Math.sqrt(Math.abs(ch.q)) | 0;

                for (let ro = 0; ro < 2 * Math.PI; ro += Math.PI / n) {
                    let r = vec2.fromValues(radius * Math.cos(ro), radius * Math.sin(ro));
                    let r1 = vec2.create();
                    vec2.add(r1, r, ch.r);
                    this.drawLine(r1, ch);
                }
            }
            // Magnetic field strength
            this.drawB(ch.r);

            // Track
            if (this.isTrack) {
                this.ctx2.fillRect(ch.r[0] - 0.5, ch.r[1] - 0.5, 1, 1);
            }
        }

    }

    drawB(r: vec2) {
        const ctx = this.ctx2;

        const color = (x: number, y: number, depth: number, channel: number) => {
            const data = this.imData.data;
            let i1 = (y * 100 + x) * 4 + channel;
            let i2 = i1 + 4;
            let i3 = i1 + 100 * 4;
            let i4 = i3 + 4;
            data[i1] = data[i2] = data[i3] = data[i4] = depth;
        }        

        // fill the blue channel
        let x1 = r[0] - 50, y1 = r[1] - 50;
        
        for (let y = 0; y < 100; y++) {
            for (let x = 0; x < 100; x++) {
                let r1 = vec2.fromValues(x1 + x, y1 + y) 
                let b = this.space.BatR(r1);
                let depth = vec2.length(b) * 25500 | 0;
                 
                console.log(y, x, depth)
                color(x, y, depth, 2); // blue
                color(x, y, 255, 3);
            }
        }
        ctx.putImageData(this.imData, x1, y1);

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
    // draw1() {
    //     const ctx = doc.canvas.getContext("2d")!;
    //     const K = 1; 
    //     ctx.save();
    //     ctx.scale(glo.SCALE, glo.SCALE);
    //     ctx.lineWidth = 1/glo.SCALE;
    //     ctx.clearRect(0, 0, this.space.width, this.space.height)
    //     ctx.beginPath()
    //     for (let y = 0; y < this.space.height; y++) {
    //         for (let x = 0; x < this.space.width; x++) {
    //             const e = Math.hypot(this.space.E[y][x][0], this.space.E[y][x][1]);
    //             ctx.fillRect(x, y, 0.1, 0.1)
    //             ctx.moveTo(x, y)
    //             const x1 = this.space.E[y][x][0] * K 
    //             const y1 = this.space.E[y][x][1] * K
                
    //             ctx.lineTo(x + x1, y + y1);
    //         }
    //     }
    //     ctx.stroke();
    //     ctx.restore();
    // }

    // draw2() {
    //     const K = 100;
    //     const ctx = doc.canvas.getContext("2d")!;
    //     ctx.save();
    //     ctx.scale(glo.SCALE, glo.SCALE);
    //     ctx.lineWidth = 1/glo.SCALE;
    //     for (let y = 0; y < this.space.height; y++) {
    //         for (let x = 0; x < this.space.width; x++) {
    //             const e = Math.hypot(this.space.E[y][x][0], this.space.E[y][x][1])
    //             ctx.fillStyle = `rgb(
    //                 ${Math.floor(K * e*e)}
    //                 ${Math.floor(K * e*e)}
    //                 ${Math.floor(K * e*e)}
    //             )`;
    //             ctx.fillRect(x, y, 1, 1);
    //         }
    //     }
    //     ctx.restore();
    // }


    // draw3() {
    //     const ctx = doc.canvas.getContext("2d")!;

    //     const color = (x: number, y: number, depth: number, channel: number) => {
    //         const data = this.imData.data;
    //         let i1 = (y * doc.canvas.width + x) * 4 + channel;
    //         let i2 = i1 + 4;
    //         let i3 = i1 + doc.canvas.width * 4;
    //         let i4 = i3 + 4;
    //         data[i1] = data[i2] = data[i3] = data[i4] = depth;
    //     }        

    //     // fill the blue channel
    //     for (let y = 0; y < this.space.height; y++) {
    //         for (let x = 0; x < this.space.width; x++) {
    //             const depth = Math.floor(Math.hypot(this.space.E[y][x][0], this.space.E[y][x][1]) * 255 * 1000)
    //             // console.log(y, x, depth)
    //             color(x, y, depth, 2); // blue
    //             color(x, y, 255, 3);
    //         }
    //     }
    //     ctx.putImageData(this.imData, 0, 0);

    // }
//#endregion
}