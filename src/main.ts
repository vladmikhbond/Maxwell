import Controller from "./controller/Controller.js";
import { glo } from "./globals.js"; 
import Charge from './models/Charge.js';
import  Space  from "./models/Space.js";
import View from "./view/View.js";


const space = new Space();
// парал рух двох зар
// space.charges.push(new Charge(10,   200, 100,      0, 0,   0.1));
// space.charges.push(new Charge(10,   300, 100,      0, 0,   0.1));

const view = new View(space);
new Controller(space, view);
view.draw();










