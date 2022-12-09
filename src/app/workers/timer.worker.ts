/// <reference lib="webworker" />

let interval: any = null;
let saveInterval: any = null;

let timerValue = 0;

addEventListener('message', ({ data: command }) => {
    switch (command.name) {
        case 'reset':
            reset();
            break;
        case 'stop':
            stop();
            break;
        case 'start':
            start(command.intervalMs);
            break;
        case 'restore':
            restore(command.value);
            break;
    
        default:
            postMessage({ type: 'error', message: `Unknown worker command "${command}"` })
            break;
    }
});

function stop() {
    if (interval) {
        clearInterval(interval);
        interval = null;
    }
    postMessage({ type: 'save', value: timerValue });
}
function reset() {
    stop();
    timerValue = 0;
    postMessage({ type: 'data', value: 0 });
    postMessage({ type: 'save', value: timerValue });
}
function start(intervalMs: number = 1000) {
    interval = setInterval(() => {
        timerValue += intervalMs;
        postMessage({ type: 'data', value: timerValue });
    }, intervalMs);
    saveInterval = setInterval(() => {
        postMessage({ type: 'save', value: timerValue });
    }, Math.max(intervalMs, 1000));
}
function restore(value: number) {
    timerValue = value;
    postMessage({ type: 'data', value: timerValue });
}