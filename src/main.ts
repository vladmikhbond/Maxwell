import { glo } from "./globals.js"; 
import Charge from './models/Charge.js';
import { Space } from "./models/Space.js";
import View from "./view/View.js";


const space = new Space();
space.charges.push(new Charge(10,   0, 0,      1, 1,   0.01));
space.charges.push(new Charge( 1,   200, 50,  -1, 1,   0.01,  false ));

const view = new View(space);

setInterval(() => {
    space.step();
    view.draw();
}, glo.INTERVAL)









