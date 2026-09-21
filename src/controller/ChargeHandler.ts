// import { dist, } from '../model/Geometry.js'
// import Bomb from '../model/Bomb.js'
// import Controller from './Controller.js';
import { vec2 } from 'gl-matrix';
import Handler from './Handler.js';
import { getChargeParams, setChargeParams } from './params.js';
import Charge from '../models/Charge.js';
// import { getGasParams } from './params.js';

const CLICK_DIST = 3;

export default class ChargeHandler extends Handler {
   
    mousedown(e: MouseEvent) {
        super.mousedown(e);
        // якщо курсор в середені обраного заряду, таскати його
        let sel = this.space.selectedCharge;
        if (sel && sel.isInside(vec2.fromValues(e.offsetX, e.offsetY))) {
            this.draggingObject = sel;
        }          
    }

    mousemove(e: MouseEvent) {
        super.mousemove(e);
        if (!this.isDrawing) 
            return;

        this.view.draw();
        this.view.drawGrayArc(this.currentX, this.currentY, e.offsetX, e.offsetY);
        
    }

    mouseup(e: MouseEvent) {
        if (!this.isDrawing) 
            return;
        this.isDrawing = false;
        
        if (this.draggingObject) {
            this.draggingObject = null;
            return;
        }   

        let x1 = this.currentX, y1 = this.currentY;
        let x2 = e.offsetX, y2 = e.offsetY;
        let drawDist = Math.hypot(x2 - x1, y2 - y1);

        // just mouse click
        if (drawDist <= CLICK_DIST) {
            // Try to select charge
            this.space.trySelectCharge(x1, y1);
            if (this.space.selectedCharge) {
                setChargeParams(this.space.selectedCharge);
            }
        } else {
            // Create new charge & selest it
            let params = getChargeParams();
            if (params) {
                let [q, vx, vy, m, f] = params;
                vx = (x2 - x1) / 10;
                vy = (y2 - y1) / 10;
                const newCharge = new Charge(q, x1, y1, vx, vy, m, f==1);
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
                // } else {
                //     this.space.clearBalls()
                // }
                this.view.draw();
                break;
            // case 'ArrowUp':
            //     if (this.space.selectedBall) {
            //         this.space.selectedBall.y -= 1;
            //         this.view.draw();
            //     }
            //     break;
            // case 'ArrowDown':
            //     if (this.space.selectedBall) {
            //         this.space.selectedBall.y += 1;
            //         this.view.draw();
            //     }
            //     break;
            // case 'ArrowLeft':
            //     if (this.space.selectedBall) {
            //         this.space.selectedBall.x -= 1;
            //         this.view.draw();
            //     }
            //     break;
            // case 'ArrowRight':
            //     if (this.space.selectedBall) {
            //         this.space.selectedBall.x += 1;
            //         this.view.draw();
            //     }
            //     break;
        }
    }

}
