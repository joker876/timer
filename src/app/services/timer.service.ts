import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TimerService {

    worker = new Worker(new URL('../workers/timer.worker', import.meta.url));

    constructor() {
        this.worker.onmessage = ({ data }) => {
            this.handleWorkerResponse(data);
        };
        let value = this._loadTimer();
        this.worker.postMessage({ name: 'restore', value });
    }

    private _timerSubject = new BehaviorSubject(0);
    public timer$ = this._timerSubject.asObservable();
    private _timerStringSubject = new BehaviorSubject('Loading...');
    public timerString$ = this._timerStringSubject.asObservable();
    private _timerPreciseStringSubject = new BehaviorSubject('Loading...');
    public timerPreciseString$ = this._timerPreciseStringSubject.asObservable();

    reset(): void {
        this.worker.postMessage({ name: 'reset' });
    }
    start(intervalMs: number = 1000): void {
        this.worker.postMessage({ name: 'start', intervalMs });
    }
    stop(): void {
        this.worker.postMessage({ name: 'stop' });
    }

    handleWorkerResponse(res: any): void {
        switch (res.type) {
            case 'data':
                this._emit(res.value);
                break;
            case 'save':
                this._saveTimer(res.value);
                break;
            case 'error':
                throw new Error(res.message);
        
            default:
                throw new Error("Unexpected worker response " + res);
        }
    }

    private _emit(val: number): void {
        this._timerSubject.next(val);
        this._timerStringSubject.next(this._msToString(val));
        this._timerPreciseStringSubject.next(this._msToPreciseString(val));
    }
    private _msToString(value: number): string {
        let timeArr = this._msToObj(value);
        let retArr = [];
        if (timeArr.d) {
            retArr.push(timeArr.d + 'd');
        }
        if (timeArr.d || timeArr.h) {
            retArr.push(timeArr.h + 'h');
        }
        if (timeArr.d || timeArr.h || timeArr.m) {
            retArr.push(timeArr.m + 'm');
        }
        retArr.push(timeArr.s + 's');
        return retArr.join(' ');
    }
    private _msToPreciseString(value: number): string {
        let timeArr = this._msToObj(value);
        return this._msToString(value) + timeArr.ms + 'ms';
    }
    private _msToObj(value: number): { ms: number, s: number, m: number, h: number, d: number } {
        const ms = value % 1000;
        value -= ms;
        value /= 1000;
        const s = value % 60;
        value -= s;
        value /= 60;
        const m = value % 60;
        value -= m;
        value /= 60;
        const h = value % 24;
        value -= h;
        value /= 24;
        const d = value;
        return { ms, s, m, h, d };
    }

    private _loadTimer(): number | null {
        let timer = localStorage.getItem('timer-value');
        if (timer) return Number(timer);
        return null;
    }
    private _saveTimer(value: number | null): void {
        localStorage.setItem('timer-value', String(value ?? ''));
    }
}
