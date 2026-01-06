import { DateFormatPipeWithTimeZone } from './../../shared/pipes/custom-date.pipe';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { GrantHistoryService } from './grant-history.services';
import { GrantCommonDataService } from '../services/grant-common-data.service';

@Component({
  selector: 'app-grant-history',
  templateUrl: './grant-history.component.html',
  styleUrls: ['./grant-history.component.css']
})
export class GrantHistoryComponent implements OnInit, OnDestroy {

  grantCallActionLog: any = [];
  historyId: any;
  $subscriptions: Subscription[] = [];
  grantCallId: any;
  actionsLogs: any = [];

  constructor(private _detailsService: GrantHistoryService, public _commonData: GrantCommonDataService,
    public _dataFormatPipe: DateFormatPipeWithTimeZone) { }

  ngOnInit() {
    this.fetchHistory();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  fetchHistory() {
    this.$subscriptions.push(this._commonData.$grantCallData.subscribe((data: any) => {
        this.$subscriptions.push(this._detailsService.fetchGrantHistory({ 'grantCallId': parseInt(data.grantCall.grantCallId, 10) })
          .subscribe((result: any) => {
            this.updateHistoryLogs(result);
          }));
    }));
  }

  updateHistoryLogs(data: any) {
    if (data.grantCallActionLogs) {
      this.actionsLogs = [];
      data.grantCallActionLogs.forEach((historyObj) => {
        const date = this._dataFormatPipe.transform(historyObj.updateTimestamp);
        this.actionsLogs[date] = this.actionsLogs[date] ? this.actionsLogs[date] : [];
        this.actionsLogs[date].push(historyObj);
      });
    }
  }
  /**
   * @param
   * When using keyvalue pipe sortNull act as comparision Function to avoid sorting based on key
   */
  sortNull() { return 0; }
}
