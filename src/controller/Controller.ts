import { Space } from "../models/Space.js";

export class Controller 
{

    public space: Space;
    public view: View;

    private intervalId = 0;   // base field for timeMode property

    private _mousePos = new Point(0, 0);
    private _createMode = CreateMode.Ball;


    constructor(space: Space, view: View) {
        this.space = space;
        this.view = view;
        // set UI
        this.setModelSize(space.width, space.height);        
        this.timeMode = TimeMode.Stop;
        this.createMode = CreateMode.Ball;
        //
        this.addEventHandlers();
        this.addDataHandlers() 
    }
}