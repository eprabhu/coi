import { DateFormatPipeWithTimeZone } from './../../../shared/pipes/custom-date.pipe';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DetailsService } from '../details.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';

@Component({
  selector: 'app-task-history',
  templateUrl: './task-history.component.html',
  styleUrls: ['./task-history.component.css']
})
export class TaskHistoryComponent implements OnInit, OnDestroy {

  taskActionLogs: any = [];
  taskId: any;
  $subscriptions: Subscription[] = [];
  actionsLogs: any = [];

  constructor(private _detailsService: DetailsService, private route: ActivatedRoute,
    public _dataFormatPipe: DateFormatPipeWithTimeZone) { }

  ngOnInit() {
    this.taskId = this.route.snapshot.queryParamMap.get('taskId');
    this.fetchHistory();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  fetchHistory() {
    this.$subscriptions.push(this._detailsService.fetchTaskHistory({ 'taskId': this.taskId })
      .subscribe((data) => {
        this.updateHistoryLogs(data);
      }));
  }
  /**
   * @param  {} data : history log array
   * converts the key value pair to array of objects
   */
  updateHistoryLogs(data) {
    if (data.taskActionLogs) {
      this.actionsLogs = [];
      data.taskActionLogs.forEach((historyObj) => {
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
