import { glo, doc } from "../globals.js";
import Space from "../models/Space.js";
import View from "../view/View.js";
import ChargeHandler from "./ChargeHandler.js";

import Handler from "./Handler.js";

import { getSizeParams } from "./params.js";

enum CreateMode {
    Info,
    Charge,
}

export default class Controller 
{

    public space: Space;
    public view: View;
    chargeHandler = new ChargeHandler(this);

    timer: ReturnType<typeof setInterval> | 0 = 0;

    //#region CreateMode
    private _createMode = CreateMode.Charge;

    set createMode(mode: CreateMode) 
    {
        let gas = document.getElementById("gasParams")!.style;
        let wal = document.getElementById("wallParams")!.style;
        let dev = document.getElementById("devsParams")!.style;
        gas.display = wal.display = dev.display = "none";

        this._createMode = mode;
        switch(mode) {
            case CreateMode.Info:
                break;
            case CreateMode.Charge:
                this.switchHandlers(this.chargeHandler);
                gas.display = "inline";
                break;
            
        }
                 
    }

    get createMode() {
        return this._createMode;
    }

    private switchHandlers(handler: Handler)  {
        doc.canvas.onmousedown = (e) => handler.mousedown(e);
        doc.canvas.onmousemove = (e) => handler.mousemove(e);
        doc.canvas.onmouseup = (e) => handler.mouseup(e);
        doc.canvas.onkeydown = (e) => handler.keydown(e);
    }
    //#endregion CreateMode


    // private intervalId = 0;   // base field for timeMode property

    // private _mousePos = new Point(0, 0);
    


    constructor(space: Space, view: View) {
        this.space = space;
        this.view = view;
        this.chargeHandler = new ChargeHandler(this);

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


    addEventHandlers() 
    {
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