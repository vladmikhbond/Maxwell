import { glo, doc } from "../globals.js";
import { Space } from "../models/Space.js";
import View from "../view/View.js";
import { getSizeParams } from "./params.js";

export class Controller 
{

    public space: Space;
    public view: View;
    timer: ReturnType<typeof setInterval> | 0 = 0;


    // private intervalId = 0;   // base field for timeMode property

    // private _mousePos = new Point(0, 0);
    // private _createMode = CreateMode.Ball;


    constructor(space: Space, view: View) {
        this.space = space;
        this.view = view;

        //
        this.addEventHandlers();

    }
    setModelSize() {
        let [w, h] = [this.space.width, this.space.height];
        document.documentElement.style.setProperty('--canvas-width', w+'px');
        document.documentElement.style.setProperty('--canvas-height', h+'px');            
        doc.canvas.height = h;
        doc.canvas.width = w;
        doc.canvas2.height = h;
        doc.canvas2.width = w;
    }


    addEventHandlers() {
        // Size params changed 
        document.getElementById("sizeParams")!.addEventListener("keydown", (e: KeyboardEvent) => 
        {
            if (e.key == "Enter") {
                const size = getSizeParams();
                if (size) {
                    [this.space.width, this.space.height] = size;
                    this.setModelSize();
                    this.view.draw();
                }
            }                
        }); 


        document.getElementById("E_Checkbox")?.addEventListener("change", e => {
           glo.isE = (e.target as HTMLInputElement).checked;
           this.view.draw();
        });

        document.getElementById("B_Checkbox")?.addEventListener("change", e => {
           glo.isB = (e.target as HTMLInputElement).checked;
           this.view.draw();
        });

        document.getElementById("runButton")?.addEventListener("click", e => {
            if (this.timer) this.stop(); 
            else this.run();           
        });

        // do one step
        document.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key == "1") {
                this.stop();
                this.step();
            }
        }); 
    }

    step() {
        this.space.step();  
        this.view.draw();
        glo.time++;   
    }

    
    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = 0;
        }
    }

    run() {
        if (this.timer) 
            return;
        this.timer = setInterval(() => { 
            this.step();
        }, glo.INTERVAL);
    }

}