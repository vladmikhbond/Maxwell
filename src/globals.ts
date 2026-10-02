const Ke = 1;
const Kb = 1;


export const glo = 
{
    Ke: Ke,     // стала в законі Кулона 
    Kb: Kb,     // стала в законі Ампера
    eps0: 1 / (Ke * 4 * Math.PI),  
    miu0: Kb * 4 * Math.PI,        
    C: Ke * Kb,
    SCALE: 1,
    INTERVAL: 10,
    time: 0,      // time in ticks (1 sec = 1000/INTERVAL ticks)

    isB: true,
    isE: true, 
    isTracing: true, 
    
}


export const doc = 
{
    canvas: <HTMLCanvasElement>document.getElementById("canvas"),
    canvas2: <HTMLCanvasElement>document.getElementById("canvas2"),
}
