import { Component, OnInit, Input, OnChanges, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonService } from '../../../../../common/services/common.service';
import { subscriptionHandler } from '../../../../../common/utilities/subscription-handler';
import {concatUnitNumberAndUnitName} from '../../../../../common/utilities/custom-utilities'
@Component({
  selector: 'app-general-details-view',
  templateUrl: './general-details-view.component.html',
  styleUrls: ['./general-details-view.component.css']
})

export class GeneralDetailsViewComponent implements OnInit, OnChanges, OnDestroy {

  @Input() result: any = {};
  isExternalUrl = false;
  grantTheme: any;
  slicedGrantExternalUrl = '';
  $subscriptions: Subscription[] = [];
  closingTime: any;
  concatUnitNumberAndUnitName = concatUnitNumberAndUnitName;
  constructor(public _commonService: CommonService) { }

  ngOnInit() {
  }

  ngOnChanges() {
    this.updateSliceStringCondtion(this.result.grantCall.externalUrl, 'slicedGrantExternalUrl', 'isExternalUrl');
    this.closingTime = this.convertTo12HourFormat(this.result.grantCall.closingTime); 
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  convertTo12HourFormat(time) {
    time = time && time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
    if (time.length > 1) {
      time = time.slice(1);
      time[5] = +time[0] < 12 ? ' AM' : ' PM';
      time[0] = +time[0] % 12 || 12;
      time[3] = null;
    }
    return time.join('');
  }

  updateSliceStringCondtion(input, slicestring, condition) {
    input = this.removeTags(input);
    this[condition] = input.length > 240 ? true : false;
    this[slicestring] = this[condition] ? input.slice(0, 240) : '';
  }
  removeTags(input) {
    if (input) {
      return input.replace(/<[^>]*>/g, '');
    } else {
      return 0;
    }
  }

  redirectUrl() {
    if (this.result.grantCall.externalUrl.includes('http')) {
      window.open(this.result.grantCall.externalUrl, '_blank');
    } else {
      window.open('//' + this.result.grantCall.externalUrl, '_blank');
    }
  }
}
