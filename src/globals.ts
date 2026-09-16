const Ke = 1000;
const Kb = 0.1;


export const glo = 
{
    Ke: Ke,     // стала в законі Кулона 
    Kb: Kb,     // стала в законі Ампера
    eps0: 1 / (Ke * 4 * Math.PI),
    miu0: Kb * 4 * Math.PI,
    SCALE: 1,
    INTERVAL: 100,
    time: 0,      // time in ticks (1 sec = 1000/INTERVAL ticks)
     
}

export const doc = 
{
    canvas: <HTMLCanvasElement>document.getElementById("canvas"),
    canvas2: <HTMLCanvasElement>document.getElementById("canvas2"),
}
