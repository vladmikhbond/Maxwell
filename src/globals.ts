
export const glo = 
{
    Ke: 1000,     // стала в законі Кулона 
    Kb: 0.002,    // стала в законі Ампера      
    SCALE: 1,
    TIME_INTERVAL: 5,
    time: 0,      // time in ticks (1 sec = 1000/INTERVAL ticks)

    isB: true,
    isE: true, 
    isTracing: true, 
    
}


export const doc = 
{
    canvas: <HTMLCanvasElement>document.getElementById("canvas"),
    canvas2: <HTMLCanvasElement>document.getElementById("canvas2"),
    info: <HTMLSpanElement>document.getElementById("info"),
}
