import Charge from "../models/Charge";
import Space from "../models/Space";
import Wire from "../models/Wire";

export default class Store {
    // Перетворює аргумент в json-рядок
    static serialize(space: Space): string {
        return JSON.stringify(space);
    }

    static deserialize(json: string): Space | null {
        try {
            const spc = JSON.parse(json) as Space;
            const space = new Space();
            Object.assign(space, spc);
            //
            space.charges = [];
            for (let ch of spc.charges) {
                let charge = new Charge(ch.q, ch.r[0], ch.r[1], ch.v[0], ch.v[1], ch.m, ch.fixed);
                space.charges.push(charge);
            }
            //
            space.wires = [];
            for (let wi of spc.wires) {
                let wire = new Wire(wi.x, wi.j);
                space.wires.push(wire);
            }
            return space;
        } catch {
            return null;
        }
    }
}