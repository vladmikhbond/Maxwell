import { vec2 } from 'gl-matrix';
import Handler from './Handler.js';
import { getChargeParams, setChargeParams } from './params.js';
import Charge from '../models/Charge.js';


const CLICK_DIST = 3;

export default class ChargeHandler extends Handler {
   
    mousedown(e: MouseEvent) {
        super.mousedown(e);
        // якщо курсор в середені обраного заряду, таскати його
        let sel = this.space.selectedCharge;
        let offsetX = e.offsetX - this.view.translateX,
            offsetY = e.offsetY - this.view.translateY; 
        if (sel && sel.isInside(vec2.fromValues(offsetX, offsetY))) {
            this.draggingObject = sel;
        }          
    }

    mousemove(e: MouseEvent) {
        super.mousemove(e);
        if (!this.isDrawing) 
            return;
        let currentX = this.currentX - this.view.translateX,
            currentY = this.currentY - this.view.translateY,
            offsetX = e.offsetX - this.view.translateX,
            offsetY = e.offsetY - this.view.translateY; 
        this.view.draw();
        this.view.drawGrayArc(currentX, currentY, offsetX, offsetY);
        
    }

    mouseup(e: MouseEvent) {
        super.mouseup(e);
        
        if (!this.isDrawing) 
            return;
        this.isDrawing = false;
        
        if (this.draggingObject) {
            this.draggingObject = null;
            return;
        }   

        let x1 = this.currentX - this.view.translateX, 
            y1 = this.currentY - this.view.translateY,
            x2 = e.offsetX - this.view.translateX, 
            y2 = e.offsetY - this.view.translateY;

        let drawDist = Math.hypot(x2 - x1, y2 - y1);

        // just mouse click
        if (drawDist <= CLICK_DIST) {
            // Try to select charge
            this.space.trySelectCharge(x1, y1);
            if (this.space.selectedCharge) {
                setChargeParams(this.space.selectedCharge);
            }
        } else {
            // Create new charge & select it
            let params = getChargeParams();
            if (params) {
                let vx = (x2 - x1) / 10;
                let vy = (y2 - y1) / 10;
                const newCharge = new Charge(params.q, x1, y1, vx, vy, params.m, params.fixed == 1);
                this.space.charges.push(newCharge);
                this.space.selectedCharge = newCharge;
                setChargeParams(newCharge);
            }
        }
        this.view.draw();  
    }


    keydown(e: KeyboardEvent) 
    {
        super.keydown(e);
        
        switch (e.key) {
            case 'Delete':
                if (this.space.selectedCharge) {
                    this.space.removeSelectedCharge();
                }
                this.view.draw();
                break;
        }
    }

}
