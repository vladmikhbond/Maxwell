
import Handler from './Handler.js';

export default class InfoHandler extends Handler {
   
    mousedown(e: MouseEvent) {
        super.mousedown(e);
        // // якщо курсор в середені обраного заряду, таскати його
        // let sel = this.space.selectedWire;
        // if (sel && Math.abs(sel.x - e.offsetX) < 3) {
        //     this.draggingObject = sel;
        // }          
    }

    mousemove(e: MouseEvent) {
        super.mousemove(e);
        // if (!this.isDrawing) 
        //     return;

        // this.view.draw();
        // this.view.drawGrayVerLine(e.offsetX);
        
    }

    mouseup(e: MouseEvent) {
        if (!this.isDrawing) 
            return;

        // this.isDrawing = false;
        
        // if (this.draggingObject) {
        //     this.draggingObject = null;
        //     return;
        // }   

        // let x1 = this.currentX, y1 = this.currentY;
        // let x2 = e.offsetX, y2 = e.offsetY;
        // let drawDist = Math.hypot(x2 - x1, y2 - y1);

        // // just mouse click
        // if (drawDist <= CLICK_DIST) {
        //     // Try to select wire
        //     if (this.space.trySelectWire(x1)) {
        //         setWireParams(this.space.selectedWire!);
        //     }
        // } else {
        //     // Create new wire & select it
        //     let params = getWireParams();

        //     const newWire = new Wire(x2, params.j);
        //     this.space.wires.push(newWire);
        //     this.space.selectedWire = newWire;
        //     setWireParams(this.space.selectedWire);
        // }
        // this.view.draw();  
    }


    keydown(e: KeyboardEvent) 
    {
        super.keydown(e);
        
        // switch (e.key) {
        //     case 'Delete':
        //         if (this.space.selectedWire) {
        //             this.space.removeSelectedWire();
        //         }

        //         this.view.draw();
        //         break;

        // }
    }

}
