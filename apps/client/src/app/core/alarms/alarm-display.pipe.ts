import { Pipe, PipeTransform } from '@angular/core';
import { AlarmDisplay } from './alarm-display';
import { Alarm } from './alarm';
import { AlarmsFacade } from './+state/alarms.facade';
import { combineLatest, Observable } from 'rxjs';
import { EorzeanTimeService } from '../time/eorzean-time.service';
import { map } from 'rxjs/operators';

@Pipe({
  name: 'alarmDisplay',
  pure: true
})
export class AlarmDisplayPipe implements PipeTransform {

  constructor(private alarmsFacade: AlarmsFacade, private etime: EorzeanTimeService) {
  }

  transform(alarm: Alarm): Observable<AlarmDisplay> {
    return combineLatest(
      this.alarmsFacade.getRegisteredAlarm(alarm),
      this.etime.getEorzeanTime()
    ).pipe(
      map(([registeredAlarm, date]) => {
        const display = this.alarmsFacade.createDisplay(alarm, date);
        display.registered = registeredAlarm !== undefined;
        if (display.registered) {
          display.alarm.$key = registeredAlarm.$key;
        }
        return display;
      })
    );
  }

}
