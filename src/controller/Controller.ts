import { vec2 } from "gl-matrix";
import { glo, doc } from "../globals.js";
import Space from "../models/Space.js";
import View from "../view/View.js";
import ChargeHandler from "./ChargeHandler.js";

import Handler from "./Handler.js";

import { getSizeParams, getChargeParams } from "./params.js";
import Store from "../data/Store.js";

enum CreateMode {
    Info,
    Charge,
    Wire,
    Magnet
}

export default class Controller 
{

    public space: Space;
    public view: View;
    chargeHandler = new ChargeHandler(this);

    timer: ReturnType<typeof setInterval> | 0 = 0;

    //#region CreateMode
    private _creationMode = CreateMode.Charge;

    set creationMode(mode: CreateMode) 
    {
        let charge = document.getElementById("chargeParams")!.style;
        let wire = document.getElementById("wireParams")!.style;
        let magnet = document.getElementById("magnetParams")!.style;
        charge.display = wire.display = magnet.display = "none";

        this._creationMode = mode;
        switch(mode) {
            case CreateMode.Info:
                break;
            case CreateMode.Charge:
                this.switchHandlers(this.chargeHandler);
                charge.display = "inline";
                break;
            
        }
         
    }

    get creationMode() {
        return this._creationMode;
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
        this.switchHandlers(this.chargeHandler)
        this.addDataHandlers();

    }

    setSpaceSize() {
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
                    this.setSpaceSize();
                    this.view.draw();
                }
            }
            
            console.log(Store.serialize(this.space));

        }); 

        // Charge params changed 
        document.getElementById("chargeParams")!.addEventListener("keydown", (e: KeyboardEvent) => 
        {
            if (e.key == "Enter") {
                const params = getChargeParams();
                const selCharge = this.space.selectedCharge
                if (params && selCharge) {
                    let [q, vx, vy, m, f] = params;
                    selCharge.v = vec2.fromValues(vx, vy);
                    selCharge.q = q;
                    selCharge.m = m;
                    selCharge.fixed = f == 1;
                    this.view.draw();
                }
            }                
        }); 

        // Change Create Mode
        document.getElementById("createMode")!.addEventListener("change", (e: Event) =>
        {
            let str = (e.target as HTMLSelectElement).value;
            const key = str as keyof typeof CreateMode;
            this.creationMode = CreateMode[key];            
        });

        // Switch E tension on or off
        document.getElementById("E_Checkbox")?.addEventListener("change", e => {
           glo.isE = (e.target as HTMLInputElement).checked;
           this.view.draw();
        });

        // Switch B tension on or off
        document.getElementById("B_Checkbox")?.addEventListener("change", e => {
           glo.isB = (e.target as HTMLInputElement).checked;
           this.view.draw();
        });


        document.getElementById("runButton")?.addEventListener("click", e => {
            if (this.timer) this.stop(); 
            else this.run();           
        });

        // // do one step
        // document.addEventListener("keydown", (e: KeyboardEvent) => {
        //     if (e.key == "1") {
        //         this.stop();
        //         this.step();
        //     }
        // }); 
    }

    addDataHandlers() 
    {
 
        const savedSelect = <HTMLSelectElement>document.getElementById("savedInStore"); 
        const sceneName = <HTMLInputElement>document.getElementById("sceneName"); 

        fillSavedSelectOptions();

        // Put script to local store
        //
        document.getElementById("saveSceneButton")!.addEventListener("click", () => {
            let key = sceneName.value;
            const val = Store.serialize(this.space);
            localStorage.setItem(key, val);
            fillSavedSelectOptions();
        });

        // Get script from local store
        // 
        savedSelect.addEventListener("change",   () => {
            let key = savedSelect.selectedOptions[0].value
            const val = localStorage.getItem(key);
            if (val) {
                let space = Store.deserialize(val);
                if (space) {
                    this.space.charges = space.charges;
                    this.space.selectedCharge = space.selectedCharge;
                    this.view.draw();
                }
            }
        });     
 
        // Remove script from local store
        //
        document.getElementById("loadSceneButton")!.addEventListener("click", () => {
            let key = savedSelect.selectedOptions[0].value
            const val = localStorage.getItem(key);
            if (val) {
                let space = Store.deserialize(val)
                localStorage.removeItem(key);
                fillSavedSelectOptions();
            }
        });


        function fillSavedSelectOptions() {
            const keys = Object.keys(localStorage);
            keys.sort();
            savedSelect.innerHTML = "";
            // Add options to savedSelect element. One option for every key.
            keys.forEach((key) => {
                const option = document.createElement("option");
                option.value = key;
                option.textContent = key;
                savedSelect.appendChild(option);
            });
        }
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