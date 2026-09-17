import { vec2 } from 'gl-matrix';
import { glo } from "../globals.js";
import { cross2 } from "./Space.js"

export default class Charge {
   r: vec2
   v: vec2
   q: number
   m: number 
   fixed: boolean

   constructor(q: number, x: number, y: number, vx: number, vy: number, m=1, fixed=false) {
      this.r = vec2.fromValues(x, y)
      this.v =  vec2.fromValues(vx, vy)
      this.q = q
      this.m = m 
      this.fixed = fixed
   }

   // Напруженість електричного поля, яку створює заряд в точці r
   EatR(r: vec2): vec2 {            
      let distance = vec2.sub(vec2.create(), r, this.r);
      const distanceSquared = vec2.squaredLength(distance);
      if (distanceSquared === 0) {
         return vec2.create();
      }
      // e
      const e = vec2.create();
      vec2.scale(
            e,
            distance,
            glo.Ke * this.q / (distanceSquared * Math.sqrt(distanceSquared)),
      );
      return e;
   }
    
   // Напруженість магнітного поля, яку створює рухомий заряд в точці r
   BatR(r: vec2): number {            
      let distance = vec2.sub(vec2.create(), r, this.r);
      const distanceSquared = vec2.squaredLength(distance);
      if (distanceSquared === 0) {
         return 0;
      }      
      let VxD = cross2(this.v, distance); 
      // Bz
      const Bz = VxD * glo.Kb * this.q / (distanceSquared * Math.sqrt(distanceSquared));
      return Bz;
   }
    

   get blindRadius() {
      const K = 5;
      return Math.sqrt(Math.abs(this.q)) * K;
   }
}