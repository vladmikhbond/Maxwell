import { vec2 } from "gl-matrix";
import { glo, doc } from "../globals.js";
import Space from "../models/Space.js";
import View from "../view/View.js";
import ChargeHandler from "./ChargeHandler.js";
import Handler from "./Handler.js";
import { getInfoParams, getChargeParams, getWireParams } from "./params.js";
import Store from "../data/Store.js";
import WireHandler from "./WireHandler.js";
import InfoHandler from "./InfoHandler.js";

enum CreateMode {
    Info,
    Charge,
    Wire,
}



export default class Controller 
{

    public space: Space;
    public view: View;

    chargeHandler: ChargeHandler;
    wireHandler: WireHandler;
    infoHandler: InfoHandler;
    
    
    timer: ReturnType<typeof setInterval> | 0 = 0;

    constructor(space: Space, view: View) {
        this.space = space;
        this.view = view;
        this.chargeHandler = new ChargeHandler(this);
        this.wireHandler = new WireHandler(this);
        this.infoHandler = new InfoHandler(this);

        //
        this.addEventHandlers();
        this.addDataHandlers();

        // імітація натискання клавіши Enter в полі infoParams
        (document.getElementById("infoParams") as HTMLInputElement).dispatchEvent(new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            bubbles: true,
            cancelable: true
        }));
        // події для отримання первісних значень з елементів UI
        (document.getElementById("bRange") as HTMLInputElement).dispatchEvent(new Event('change'));
        (document.getElementById("eRange") as HTMLInputElement).dispatchEvent(new Event('change'));
        (document.getElementById("createMode") as HTMLInputElement).dispatchEvent(new Event('change'));
        (document.getElementById("saveSceneButton") as HTMLInputElement).dispatchEvent(new Event('click')); 
    }


    private changeSpaceSize() {
        let [w, h] = [doc.canvas.width, doc.canvas.height];
        document.documentElement.style.setProperty('--canvas-width', w+'px');
        document.documentElement.style.setProperty('--canvas-height', h+'px');            
        doc.canvas.height = h;
        doc.canvas.width = w;
        doc.canvas2.height = h;
        doc.canvas2.width = w;
    }

    // Restore the space from a storage by a key.
    // 
    private restoreSpace(key: string, storage: Storage) {
        const val = storage.getItem(key);
        if (val) {
            let space = Store.deserialize(val);
            if (space) {
                Object.assign(this.space, space); 
                this.view.draw();
                this.view.clearCanvas2();
                this.stop();
            }
        }            
    }    

    //#region CreateMode property
    
    private _creationMode = CreateMode.Info;

    set creationMode(mode: CreateMode) 
    {
        let infoParams = document.getElementById("infoParams")!.style;
        let chargeParams = document.getElementById("chargeParams")!.style;
        let wireParams = document.getElementById("wireParams")!.style;
        let magnetParams = document.getElementById("magnetParams")!.style;

        infoParams.display = chargeParams.display = wireParams.display = magnetParams.display = "none";

        this._creationMode = mode;
        switch(mode) {
            case CreateMode.Info:
                this.switchHandlers(this.infoHandler);
                infoParams.display = "inline";
                break;
            case CreateMode.Charge:
                this.switchHandlers(this.chargeHandler);
                chargeParams.display = "inline";
                break;
            case CreateMode.Wire:
                this.switchHandlers(this.wireHandler);
                wireParams.display = "inline";
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

    addEventHandlers() 
    {
        // Info params change 
        document.getElementById("infoParams")!.addEventListener("keydown", (e: KeyboardEvent) => 
        {
            if (e.key == "Enter") {
                const params = getInfoParams();
                doc.canvas.width = params.W;
                doc.canvas.height = params.H;
                this.space.steadyMagnetic = params.sm;
                glo.isE = params.e == 1;
                glo.isB = params.b == 1;
                this.changeSpaceSize();
                this.view.draw();
            }
        }); 

        // Charge params change 
        document.getElementById("chargeParams")!.addEventListener("keydown", (e: KeyboardEvent) => 
        {
            if (e.key == "Enter") {
                const params = getChargeParams();
                const selCharge = this.space.selectedCharge;
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
                const selWire = this.space.selectedWire;
                if (params && selWire) {
                    selWire.x = params.x;
                    selWire.j = params.j;   
                }
                this.view.draw();
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
            this.view.Emin = 1.1**(Number(value)); 
            this.view.draw();
        });


        // Level of B tension
        document.getElementById("bRange")?.addEventListener("change", e => 
        {
            let value = (e.target as HTMLSelectElement).value;
            this.view.Bmax = 2**(-value); 
            this.view.draw();
        });


        // Switch tracing on or off
        document.getElementById("tracingCheckbox")?.addEventListener("change", e => 
        {
            glo.isTracing = (e.target as HTMLInputElement).checked;
            if (!glo.isTracing) {
                this.view.clearCanvas2();
            }
            this.view.draw();
        });

        document.getElementById("runButton")?.addEventListener("click", e => {
            const KEY = "run";

            if (this.timer) {
                this.stop();
            } else { 
                this.run();
                if (e.ctrlKey) {
                    // loading a temporary scene
                    this.restoreSpace(KEY, sessionStorage);     
                } else {
                    // saving a temporary scene
                    const val = Store.serialize(this.space);
                    sessionStorage.setItem(KEY, val);
                }
            }
        }); 

        document.getElementById("helpButton")!.addEventListener("click", () => {
            window.open("help.html", "_blank")?.focus();
        });
    }


    addDataHandlers() 
    {
        const savingSelect = <HTMLSelectElement>document.getElementById("savingSelect"); 
        const sceneName = <HTMLInputElement>document.getElementById("sceneName"); 
        const saveSceneButton = <HTMLButtonElement>document.getElementById("saveSceneButton");
        const removeSceneButton = <HTMLButtonElement>document.getElementById("removeSceneButton");

        fillSavedSelectOptions();

        // Put a script to the local store
        //
        saveSceneButton.addEventListener("click", () => {
            let key = sceneName.value;
            const val = Store.serialize(this.space);
            localStorage.setItem(key, val);
            fillSavedSelectOptions();
        });

        // Get a script from the local store
        // 
        savingSelect.addEventListener("change",  () => {
            let key = savingSelect.selectedOptions[0].value
            this.restoreSpace(key, localStorage);
        });     
 
        // Remove a script from the local store
        //
        removeSceneButton.addEventListener("click", () => {
            let key = sceneName.value;
            const val = localStorage.getItem(key);
            if (val) {
                localStorage.removeItem(key);
                fillSavedSelectOptions();
            }
        });

        // ---------------------- helper functions -----------------------

        function fillSavedSelectOptions() {
            const keys = Object.keys(localStorage);
            keys.sort();
            savingSelect.innerHTML = "";
            // Add options to savedSelect element. One option for every key.
            keys.forEach((key) => {
                const option = document.createElement("option");
                option.value = key;
                option.textContent = key;
                savingSelect.appendChild(option);
            });
        }

    }

    //#region step-stop-run
    
    timestamp = Date.now();

    step() {
         
        this.space.step();
        this.view.draw();
        glo.time++; 

        // show time & speed
        
        const DELTA_T = 10; 
        if (glo.time % DELTA_T == 0) {
            let t = DELTA_T / (Date.now() - this.timestamp);
            this.timestamp = Date.now(); 
            doc.info.innerHTML = `${glo.time} --${t.toFixed(2)}--`;
        }
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
            this.timestamp = Date.now(); 
            this.step();
        }, glo.TIME_INTERVAL);
    }

    //#endregion
}