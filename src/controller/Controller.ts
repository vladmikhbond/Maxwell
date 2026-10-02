import { vec2 } from "gl-matrix";
import { glo, doc } from "../globals.js";
import Space from "../models/Space.js";
import View from "../view/View.js";
import ChargeHandler from "./ChargeHandler.js";
import Handler from "./Handler.js";
import { getInfoParams, getChargeParams, getWireParams } from "./params.js";
import Store from "../data/Store.js";
import WireHandler from "./WireHandler.js";

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
    chargeHandler: ChargeHandler;
    wireHandler: WireHandler;
    
    timer: ReturnType<typeof setInterval> | 0 = 0;

    constructor(space: Space, view: View) {
        this.space = space;
        this.view = view;
        this.chargeHandler = new ChargeHandler(this);
        this.wireHandler = new WireHandler(this);

        //
        this.addEventHandlers();
        this.addDataHandlers();

        // події для отримання первісних значень з елементів UI
        (document.getElementById("bRange") as HTMLInputElement).dispatchEvent(new Event('change'));
        (document.getElementById("eRange") as HTMLInputElement).dispatchEvent(new Event('change'));
        (document.getElementById("createMode") as HTMLInputElement).dispatchEvent(new Event('change'));
    }

    //#region CreateMode property
    
    private _creationMode = CreateMode.Info;

    set creationMode(mode: CreateMode) 
    {
        let info = document.getElementById("infoParams")!.style;
        let charge = document.getElementById("chargeParams")!.style;
        let wire = document.getElementById("wireParams")!.style;
        let magnet = document.getElementById("magnetParams")!.style;

        info.display = charge.display = wire.display = magnet.display = "none";

        this._creationMode = mode;
        switch(mode) {
            case CreateMode.Info:
                info.display = "inline";
                break;
            case CreateMode.Charge:
                this.switchHandlers(this.chargeHandler);
                charge.display = "inline";
                break;
            case CreateMode.Wire:
                this.switchHandlers(this.wireHandler);
                wire.display = "inline";
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

    changeSpaceSize() {
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
        // Info params change 
        document.getElementById("infoParams")!.addEventListener("keydown", (e: KeyboardEvent) => 
        {
            if (e.key == "Enter") {
                const params = getInfoParams();
                this.space.width = params.W;
                this.space.height = params.H;
                this.changeSpaceSize();
                this.view.draw();
            }
        }); 

        // Charge params change 
        document.getElementById("chargeParams")!.addEventListener("keydown", (e: KeyboardEvent) => 
        {
            if (e.key == "Enter") {
                const params = getChargeParams();
                const selCharge = this.space.selectedCharge
                if (params && selCharge) {
                    selCharge.v = vec2.fromValues(params.vx, params.vy);
                    selCharge.q = params.q;
                    selCharge.m = params.m;
                    selCharge.fixed = params.fixed == 1;
                    this.view.draw();
                }
            }                
        }); 

        // Wire params change 
        document.getElementById("wireParams")!.addEventListener("keydown", (e: KeyboardEvent) => 
        {
            if (e.key == "Enter") {
                const params = getWireParams();
                
                if (params) {
                    this.space.steadyMagnetic = params.sm;
                    this.view.draw();
                }
            }                
        }); 

        // createMode change
        document.getElementById("createMode")!.addEventListener("change", (e: Event) =>
        {
            let str = (e.target as HTMLSelectElement).value;
            const key = str as keyof typeof CreateMode;
            this.creationMode = CreateMode[key];            
        });


        // Level of E tension
        document.getElementById("eRange")?.addEventListener("change", e => 
        {
            let value = (e.target as HTMLSelectElement).value;
            glo.isE = value !== '2';

            this.view.Emin = +value; 
            document.getElementById("eSpan")!.innerHTML = this.view.Emin.toFixed(1) ;
            this.view.draw();
        });


        // Level of B tension
        document.getElementById("bRange")?.addEventListener("change", e => 
        {
            let value = (e.target as HTMLSelectElement).value;
            glo.isB = value !== '0';

            this.view.Bmax = 2**(-value); 
            document.getElementById("bSpan")!.innerHTML = this.view.Bmax.toExponential(0) ;
            this.view.draw();
        });


        // Switch tracing on or off
        document.getElementById("tracingCheckbox")?.addEventListener("change", e => 
        {
            glo.isTracing = (e.target as HTMLInputElement).checked;
            if (!glo.isTracing) {
                this.view.ctx2.clearRect(0, 0, 1111, 1111)
            }
            this.view.draw();
        });

        document.getElementById("runButton")?.addEventListener("click", e => 
        {
            if (this.timer) this.stop(); 
            else this.run();           
        });

    }

    addDataHandlers() 
    {
 
        const savedSelect = <HTMLSelectElement>document.getElementById("savedInStore"); 

        fillSavedSelectOptions();

        // Put script to local store
        //
        document.getElementById("saveSceneButton")!.addEventListener("click", () => {
            const params = getInfoParams();
            let key = params.name;
            const val = Store.serialize(this.space);
            localStorage.setItem(key, val);
            fillSavedSelectOptions();
        });

        // Get script from local store
        // 
        savedSelect.addEventListener("change",  () => {
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
            let key = savedSelect.selectedOptions[0].value;
            restoreSpace(key);
        });

        // ---------------------- helper funcs -----------------------

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

        function restoreSpace(key: string) {
            const val = localStorage.getItem(key);
            if (val) {
                let space = Store.deserialize(val)
                localStorage.removeItem(key);
                fillSavedSelectOptions();
            }
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