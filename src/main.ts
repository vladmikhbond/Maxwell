import Controller from "./controller/Controller.js";
import { glo } from "./globals.js"; 
import Charge from './models/Charge.js';
import  Space  from "./models/Space.js";
import View from "./view/View.js";


const space = new Space();

const view = new View(space);
new Controller(space, view);
view.draw();










