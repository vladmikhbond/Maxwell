import { doc } from '../globals.js';
import Charge from '../models/Charge.js';
import Space from '../models/Space.js';
import Wire from '../models/Wire.js';
import View from '../view/View.js';
import Controller from './Controller.js';

const select = <HTMLSelectElement>document.getElementById('createMode');

export default class Handler {
    protected currentX = 0;
    protected currentY = 0;
    protected isDrawing = false;
    protected draggingObject: Charge| Wire | null = null;


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


    }

    mouseup(e: MouseEvent) {
        // Вибір заряду спричиняє перемикання на режим Charge
        if (this.space.trySelectCharge(e.offsetX, e.offsetY)) {
            select.value = 'Charge';
            select.dispatchEvent(new Event('change', { bubbles: true }));
        }
        // Вибір провідника спричиняє перемикання на режим Wire
        if (this.space.trySelectWire(e.offsetX)) {
            select.value = 'Wire';
            select.dispatchEvent(new Event('change', { bubbles: true }));
        }        
    }

    keydown(e: KeyboardEvent) { 
        switch (e.key) {
            // do one step
            case '1':
                this.controller.stop();            
                this.controller.step();
                break;
            case 'i': case 'I':
                select.value = 'Info';
                select.dispatchEvent(new Event('change', { bubbles: true }));
                break;
            case 'c': case 'C':
                select.value = 'Charge';
                select.dispatchEvent(new Event('change', { bubbles: true }));
                break;
            case 'w': case 'W':
                select.value = 'Wire';
                select.dispatchEvent(new Event('change', { bubbles: true }));
                break;

        }
    }


}