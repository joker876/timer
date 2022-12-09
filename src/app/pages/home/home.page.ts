import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TimerService } from './../../services/timer.service';

@Component({
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePage {

    constructor(private _timerService: TimerService) { }

    timerString$ = this._timerService.timerString$;
    
    start(): void {
        this._timerService.start(1000);
    }
    stop(): void {
        this._timerService.stop();
    }
    reset(): void {
        this._timerService.reset();
    }
}
