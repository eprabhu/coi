/** The component is basically to show Grant Call details in a Modal in whichever modules required
 *  Created by Ramlekshmy I
 *  @INPUT() - grantCallId - accepts grant call id from parent component to invoke service call
 *  @OUTPUT() - showGrantDetails - emits back false value to parent to destroy the scope of the compenent
 */
import { Component, OnInit, Input, OnChanges, OnDestroy, Output, EventEmitter } from '@angular/core';

import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { Subscription } from 'rxjs';
import { HTTP_ERROR_STATUS } from '../../app-constants';
import { CommonService } from '../../common/services/common.service';
import { GrantDetailsViewService } from './grant-details-view.service';
import { concatUnitNumberAndUnitName } from '../../common/utilities/custom-utilities';

@Component({
  selector: 'app-grant-details-view',
  templateUrl: './grant-details-view.component.html',
  styleUrls: ['./grant-details-view.component.css'],
  providers: [GrantDetailsViewService]
})
export class GrantDetailsViewComponent implements OnInit, OnChanges, OnDestroy {

  @Input() grantCallId: null;
  @Output() showGrantDetails: EventEmitter<any> = new EventEmitter<any>();

  $subscriptions: Subscription[] = [];
  grantCallDetails: any = {};
  concatUnitNumberAndUnitName = concatUnitNumberAndUnitName;

  constructor(private _commonService: CommonService, private _grantDetailsViewService: GrantDetailsViewService) { }

  ngOnInit() { }

  ngOnChanges() {
    this.loadGrantCallById();
  }

  convertTo12HourFormat(time) {
    time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
    if (time.length > 1) {
      time = time.slice(1);
      time[5] = +time[0] < 12 ? ' AM' : ' PM';
      time[0] = +time[0] % 12 || 12;
      time[3] = null;
    }
    return time.join('');
  }
  /**
   * service call to fetch data and assign them to variables
   * triggers the detail modal after data are fetched
   */
  loadGrantCallById() {
    const request = {
      'grantCallId': this.grantCallId
    };
    this.$subscriptions.push(this._grantDetailsViewService.loadGrantById(request)
    .subscribe((data: any) => {
      this.grantCallDetails = data.grantCall;
      this.grantCallDetails.closingTime = this.convertTo12HourFormat(this.grantCallDetails.closingTime);
      document.getElementById('trigger-grant-details').click();
    }, err => {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Loading grant call failed. Please try again.');
    }));
  }

  closeModal() {
    this.showGrantDetails.emit(false);
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
}
