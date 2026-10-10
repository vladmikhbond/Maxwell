import { vec2 } from 'gl-matrix';
import Handler from './Handler.js';
import { doc } from '../globals.js';

export default class InfoHandler extends Handler {
   
    mousedown(e: MouseEvent) {
        super.mousedown(e);          
    }

    mousemove(e: MouseEvent) {
        super.mousemove(e);
        // 
        if (this.isDrawing) {
            let dx = e.offsetX - this.currentX;
            let dy = e.offsetY - this.currentY;
            this.currentX = e.offsetX;
            this.currentY = e.offsetY;
            this.view.shiftX += dx;
            this.view.shiftY += dy;
            this.view.draw();
        }
        // show info
        let r = vec2.fromValues(e.offsetX, e.offsetY)
        let E = this.space.EatR(r);
        let b = this.space.BatR(r);
        doc.info.innerHTML = `Ex = ${E[0].toFixed(2)}, Ey = ${E[1].toFixed(2)}, Bz = ${b.toFixed(2)}`;     
    }

    mouseup(e: MouseEvent) {
        super.mouseup(e);
        this.isDrawing = false;
    }


    keydown(e: KeyboardEvent) 
    {
        super.keydown(e);
        
    }

}
