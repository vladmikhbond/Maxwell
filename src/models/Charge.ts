import { vec2 } from 'gl-matrix';
import { glo } from "../globals.js";

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


   // Напруженість електричного поля, яку створює цей заряд в точці r
   EatR(r: vec2, out: vec2 = vec2.create()): vec2 
   {            
      const dx = r[0] - this.r[0];
      const dy = r[1] - this.r[1];
      const diffSquared = dx * dx + dy * dy;
      if (diffSquared < 5) {    //TODO
         return vec2.set(out, 0, 0);
      }
      // e
      const scale = glo.Ke * this.q / (diffSquared * Math.sqrt(diffSquared));
      out[0] = dx * scale;
      out[1] = dy * scale;
      return out;
   }
    
   // Напруженість магнітного поля, яку створює рухомий заряд в точці r
   BatR(r: vec2): number {

      // нерухомий заряд не створює маг поля
      if (this.fixed) { 
         return 0;
      }      

      const dx = r[0] - this.r[0];
      const dy = r[1] - this.r[1];
      const diff_2 = dx * dx + dy * dy;

      // близько до заряду поля нема 
      if (diff_2 < 25) {    //TODO
         return 0;
      }      
      const VxD = this.v[0] * dy - this.v[1] * dx;
      // Bz
      const Bz = VxD * glo.Kb * this.q / (diff_2 * Math.sqrt(diff_2));
      return Bz;
   }
    

   get blindRadius() {
      const K = 1;
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