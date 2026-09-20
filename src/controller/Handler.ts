import { doc } from '../globals.js';
import Charge from '../models/Charge.js';
import Space from '../models/Space.js';
import View from '../view/View.js';
import Controller from './Controller.js';

export default class Handler {
    protected currentX = 0;
    protected currentY = 0;
    protected isDrawing = false;
    protected draggingObject: Charge | null = null;


    view: View;
    space: Space;
    controller: Controller
    
    constructor(controller: Controller) {
        this.controller = controller;
        this.space = controller.space;
        this.view = controller.view;
    }

    mousedown(e: MouseEvent) {
        this.currentX = e.offsetX;
        this.currentY = e.offsetY;
        this.isDrawing = true;
        doc.canvas.focus({focusVisible: true})
    }

    mousemove(e: MouseEvent) {
        // (<HTMLElement>document.getElementById('info2')!).innerHTML = `${e.offsetX}, ${e.offsetY}`;

        if (!this.isDrawing) {
            return;
        }
        if (this.draggingObject) {
            let dx = e.offsetX - this.currentX;
            let dy = e.offsetY - this.currentY;
            this.currentX = e.offsetX;
            this.currentY = e.offsetY;
            this.draggingObject.move(dx, dy);
            this.view.draw();
        } 
        // else {
        //     this.view.draw();
        //     this.view.drawGrayRect(this.currentX, this.currentY, e.offsetX, e.offsetY);
        // }

    }

    mouseup(e: MouseEvent) { }

    keydown(e: KeyboardEvent) { 
        switch (e.key) {
            // do one step
            case '1':
                this.controller.stop();            
                this.controller.step();
                break;

        }
    }


}