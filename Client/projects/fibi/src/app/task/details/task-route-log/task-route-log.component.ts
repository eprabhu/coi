import { Component, OnInit, OnDestroy } from '@angular/core';
import { DetailsService } from '../details.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { CommonDataService } from '../../../award/services/common-data.service';
import { CommonService } from '../../../common/services/common.service';

@Component({
  selector: 'app-task-route-log',
  template: `<workflow-engine [workFlowResult]="taskWorkflowDetails" *ngIf="taskWorkflowDetails?.task?.taskId"
    (workFlowResponse)='workFlowResponse($event)' [workFlowDetailKey]= "'task'"></workflow-engine>`
})
export class TaskRouteLogComponent implements OnInit, OnDestroy {
  taskDetails: any = {
    taskId: this._activatedRoute.snapshot.queryParamMap.get('taskId'),
    moduleItemKey: null,
    moduleItemId: this._detailsService.taskAwardId,
    moduleCode: 1,
    subModuleCode: 2,
    workflow: null,
    leadUnitNumber: null
  };
  taskWorkflowDetails: any = {};
  $subscriptions: Subscription[] = [];

  constructor(private  _detailsService: DetailsService, private _activatedRoute: ActivatedRoute,
    private _commonData: CommonDataService, public _commonService: CommonService) { }

  ngOnInit() {
    this.getAwardDetails();
    if (this.taskDetails.moduleItemId) {
      this.loadRouteLogDetails();
    }
    this.isRouteLogChange();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  getAwardDetails() {
      this.$subscriptions.push(this._commonData.awardData.subscribe((data: any) => {
        if (data) {
          this.taskDetails.leadUnitNumber = data.award.leadUnit.unitNumber;
        }
      }));
  }
  /**
   * to trigger loadRouteLogDetails() whenever the approve or disapprove button is pressed
   */
  isRouteLogChange() {
    this.$subscriptions.push(this._detailsService.isTaskRouteChangeTrigger.subscribe((data: any) => {
      if (data) {
        this.loadRouteLogDetails();
      }
    }));
  }
  /**
   * fetch workflow details
   */
  loadRouteLogDetails() {
      this.$subscriptions.push(this._detailsService.loadTaskWorkflowDetailsById(this.taskDetails)
      .subscribe(data => {
        this.taskWorkflowDetails = data;
        this.taskWorkflowDetails.availableRights = this._commonData.departmentLevelRights;
      }));
  }

  workFlowResponse(event) {
    this.loadRouteLogDetails();
    this._detailsService.isTaskBypassOrAlternateApproverTrigger.next(true);
  }

}
