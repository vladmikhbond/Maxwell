import { vec2 } from 'gl-matrix';
import { glo } from "../globals.js";
import { cross2 } from "./Space.js"

export default class Charge {
   static rayCount = 24;
   r: vec2
   v: vec2
   q: number
   m: number 
   fixed: boolean
   rays: number[] = Array(Charge.rayCount).fill(0)

   constructor(q: number, x: number, y: number, vx: number, vy: number, m=1, fixed=false) {
      this.r = vec2.fromValues(x, y)
      this.v =  vec2.fromValues(vx, vy)
      this.q = q
      this.m = m 
      this.fixed = fixed
   }

   // Напруженість електричного поля, яку створює цей заряд в точці r
   EatR(r: vec2): vec2 {            
      let diff = vec2.sub(vec2.create(), r, this.r);
      const diffSquared = vec2.squaredLength(diff);
      if (diffSquared < 25) {    //TODO
         return vec2.create();
      }
      // e
      const e = vec2.create();
      vec2.scale(
            e,
            diff,
            glo.Ke * this.q / (diffSquared * Math.sqrt(diffSquared)),
      );
      return e;
   }
    
   // Напруженість магнітного поля, яку створює рухомий заряд в точці r
   BatR(r: vec2): number {            
      let diff = vec2.sub(vec2.create(), r, this.r);
      const diffSquared = vec2.squaredLength(diff);
      if (diffSquared < 25) {    //TODO
         return 0;
      }      
      let VxD = cross2(this.v, diff); 
      // Bz
      const Bz = VxD * glo.Kb * this.q / (diffSquared * Math.sqrt(diffSquared));
      return Bz;
   }
    

   get blindRadius() {
      const K = 5;
      return Math.sqrt(Math.abs(this.q)) * K;
   }

   isInside(r: vec2) {
      return vec2.distance(r, this.r) < this.blindRadius;        
   }

   move(dx:number, dy: number) {
      this.r[0] += dx;
      this.r[1] += dy;
   }



   
}