import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, OnChanges } from '@angular/core';

@Component({
  selector: 'app-time-picker',
  templateUrl: './app-time-picker.component.html',
  styleUrls: ['./app-time-picker.component.scss']
})
export class AppTimePickerComponent implements OnInit {

  isTimer = false;
  dateTime: any;
  currentDate = new Date();
  hour: any = this.currentDate.getHours();
  minute: any = this.currentDate.getMinutes();
  period = 'AM';
  validationMessage: any;
  isFullPeriod = false;
  @ViewChild('dropdownOverlay', { static: true }) dropdownOverlay: ElementRef;
  @ViewChild('timeField', { static: true }) timeField: ElementRef;
  @Input() dateValue: any = null;
  @Input() isError: any = null;
  @Input() timeFormat: any = '24HR';
  @Output() onSelectTime: EventEmitter<any> = new EventEmitter<any>();
  scrollHeight: number;

  ngOnInit() {
    if (this.timeFormat === '24HR') {
      this.dateValue = this.convertTo12HourFormat(this.dateValue ? this.dateValue : this.hour + ':' + this.minute);
      this.setDateObject();
    } else {
      this.setDateObject();
    }
    this.emitTimeObject(false);
  }

  convertTo12HourFormat(time) {
    // Check correct time format and split into components
    time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
    if (time.length > 1) { // If time format correct
      time = time.slice(1);  // Remove full string match value
      time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
      time[0] = +time[0] % 12 || 12; // Adjust hours
    }
    return time.join(''); // return adjusted time or original string
  }

  setDateObject() {
    if (this.dateValue) {
      this.splitTime(this.dateValue);
      this.confirmTime();
    } else {
      this.setTime();
    }
  }
  splitTime(time) {
    this.period = time.slice(-2);
    time = time.substring(0, time.length - 2);
    const t2: any = time.split(':');
    this.hour = this.formatTime(parseInt(t2[0], 10));
    this.minute = t2[1];
  }

  checkErrorPermission() {
    this.validationMessage ? this.timeField.nativeElement.classList.add('is-invalid')
      : this.timeField.nativeElement.classList.remove('is-invalid');
  }
  /**
   * @param  {} event
   * @param  {} type
   * Detect mouse wheel event for changing the values of
   * hour and minute on scrolling the particular div
   * event.wheelDelta > 0 will increment the values to the max limit and
   * start from the initial value and
   * event.wheelDelta <= 0 will decrement the values to min limit and start from the final value.
   */
  onMouseWheel(event, type) {
    if (event.wheelDelta > 0) {
      type === 'H' ? this.hourUp() : this.minuteUp();
    } else {
      type === 'H' ? this.hourDown() : this.minuteDown();
    }
  }

  /**
   * Increment the hour value on up arrow click and
   * reassign to 0 when the value exceeds 12 and
   * set the complete date time
   */
  hourUp() {
    this.hour++;
    if (this.hour > 12) {
      this.hour = 1;
    }
    this.setTime();
  }

  /**
  * decrement the hour value on down arrow click and
  * reassign to 12 when the value is less than 0 and
  * set the complete date time
  */
  hourDown() {
    this.hour--;
    if (this.hour <= 0) {
      this.hour = 12;
    }
    this.setTime();
  }

  /**
   * Increment the minute value on up arrow click and
   * reassign to 0 when the value exceeds 59 and
   * set the complete date time
   */
  minuteUp() {
    this.minute++;
    if (this.minute > 59) {
      this.minute = 0;
      this.hour++;
      if(this.hour > 12) {
        this.hour = 1;
      }

    }
    this.setTime();
  }

  /**
  * decrement the hour value on down arrow click and
  * reassign to 59 when the value is less than 0 and
  * set the complete date time
  */
  minuteDown() {
    this.minute--;
    if (this.minute < 0) {
      this.minute = 59;
      this.hour--;
      if(this.hour <= 0) {
        this.hour = 12;
      }
    }
    this.setTime();
  }

  setTime() {
    this.hour = this.formatTime(parseInt(this.hour, 10));
    this.minute = this.formatTime(parseInt(this.minute, 10));
    this.confirmTime();
  }

  confirmTime() {
    this.dateTime = this.hour + ':' + this.minute + ' ' + this.period;
  }

  emitTimeObject(changeFlag) {
    this.timeFormat === '24HR' ?
    this.onSelectTime.emit({'isChange' : changeFlag, 'time': this.convertTo24Hour(this.dateTime)}) :
    this.onSelectTime.emit({'isChange' : changeFlag, 'time': this.dateTime});
  }

  /**
   * @param  {} time
   * formatting hour and minute by prefixing '0'
   * to the value in the case of given time less
   *  than 10 to make in it a 2 digit format
   */
  formatTime(time) {
    if (time < 10) {
      time = '0' + time;
    }
    return time;
  }

  /**
   * @param  {} dateTime
   * First condition will suffix a ':' to the time value
   * when the time length is 2 automatically and
   * secondly setting hour minute and period value w.r.t dateTime
   * and close the popup while typing the input field
   */
  onTimeChange(dateTime) {
    this.hour = dateTime.substring(0, 2) ? dateTime.substring(0, 2) : '00';
    this.minute = dateTime.substring(3, 5) ? dateTime.substring(3, 5) : '00';
    this.period = dateTime.slice(-2) ? dateTime.slice(-2) : 'AM';
    this.isTimer = false;
  }
  /**
   * @param  {boolean} condition
   * setting overlay and alter window scroll w.r.t popup
   * and trigger timer validation in the case of focus out of the time picker
   */
  updateOverlayState(condition: boolean) {
    if (condition) {
      this.dropdownOverlay.nativeElement.style.display = 'block';
      this.scrollHeight = document.documentElement.scrollTop;
      document.documentElement.classList.add('cdk-global-scrollblock');
      document.documentElement.style.top  = - this.scrollHeight + 'px';
    } else {
      this.dropdownOverlay.nativeElement.style.display = 'none';
      document.documentElement.classList.remove('cdk-global-scrollblock');
      document.documentElement.scrollTop = this.scrollHeight;
      this.checkValidation();
    }
    this.isTimer = condition;
  }
  /**
   * validates time picker with respect to the given pattern
   * is satisfies emit the date to the parent components else
   * show an error validation and emits false to the parent
   */
  checkValidation() {
    const pattern = (/^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$/);
    this.validationMessage = null;
    if (pattern.test(this.dateTime)) {
      this.onTimeChange(this.dateTime);
      this.emitTimeObject(true);
      this.isError = false;
    } else {
      this.validationMessage = '*Please provide a valid time (hh:mm AM/PM).';
      this.hour = '00';
      this.minute = '00';
      this.period = 'AM';
      this.onSelectTime.emit({'isChange' : true, 'time': null});
    }
    this.checkErrorPermission();
  }

  periodChange() {
    this.period = this.period === 'AM' ? 'PM' : 'AM';
    this.confirmTime();
  }

  convertTo24Hour(time) {
    if (time.indexOf('AM') !== -1 && this.hour == 12) {
      time = time.replace('12', '00');
    }
    if (time.indexOf('PM') !== -1 && this.hour < 12) {
      time = time.replace(this.hour, (parseInt(this.hour, 10) + 12));
    }
    return time.replace(/( AM| PM)/, ':00');
  }
}
