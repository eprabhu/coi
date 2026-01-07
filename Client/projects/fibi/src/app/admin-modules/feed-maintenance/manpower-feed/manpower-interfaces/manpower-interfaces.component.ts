import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonService } from '../../../../common/services/common.service';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { parseDateWithoutTimestamp } from '../../../../common/utilities/date-utilities';
import { ManpowerFeedService } from '../manpower-feed.service';
import { scrollIntoView, setFocusToElement } from '../../../../common/utilities/custom-utilities';
import {
  AwardRetriggerListResponse,
  ManpowerFeedRequestObject,
  ManpowerUserAction
} from '../manpower-feed.interface';
import {
  HTTP_ERROR_STATUS,
  HTTP_SUCCESS_STATUS
} from '../../../../app-constants';

declare var $: any;

@Component({
  selector: 'app-manpower-interfaces',
  templateUrl: './manpower-interfaces.component.html',
  styleUrls: ['./manpower-interfaces.component.css']
})
export class ManpowerInterfacesComponent implements OnInit, OnDestroy {

  constructor(
    private _manpowerFeedService: ManpowerFeedService,
    public _commonService: CommonService
  ) { }
  searchObject: ManpowerFeedRequestObject = {
    startDate: null,
    endDate: null,
    awardNumber: null,
    currentPage: 1,
    itemsPerPage: 20,
    isDownload: false,
    advancedSearch: 'L',
    sortBy: '',
    reverse: ''
  };
  tabNameMap: any = {
    'award_interface': 'AWARD_ERRORS',
    'position_request_interface': 'POSITION_ERRORS'
  };
  setFocusToElement = setFocusToElement;
  $subscriptions: Subscription[] = [];
  awardRetriggerList: AwardRetriggerListResponse;
  feedError: any = [];
  positionReqInterfaceError: any = [];
  positionDetails: any = [];
  ID: any = {};
  isFeedExpand: boolean[] = [];
  selectedTab: string;
  userAction: ManpowerUserAction;
  workdayManpowerInterfaceId: string;
  actionComment: string;
  validationMap = new Map();
  retriggerObject: any;
  awardRetriggerIndex: number;
  retriggerAwardNumber: any;
  manualUpdateIndex: number;
  pageCount: number;
  isHover = -1;
  awardNumber: string;
  resourceUniqueId: string;


  ngOnInit() {
    this.fetchAwardRetriggerList();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  public resetAllProperties(): void {
    this.isFeedExpand = [];
    this.positionDetails = [];
    this.feedError = [];
    this.positionReqInterfaceError = [];
  }
  public resetAndSearch(): void {
    this.searchObject = {
      startDate: null,
      endDate: null,
      awardNumber: null,
      currentPage: 1,
      itemsPerPage: 20,
      isDownload: false,
      advancedSearch: 'L',
      sortBy: '',
      reverse: ''
    };
    this.fetchAwardRetriggerList();
  }

  public selectUserAction(code: string): void {
    this.userAction = this.awardRetriggerList.manpowerUserActions.find(action => action.manpowerUserActionCode === code);
  }

  public fetchAwardRetriggerList(currentPage: number = 1): void {
    this.isFeedExpand = [];
    this.searchObject.currentPage = currentPage;
    this.searchObject.startDate = parseDateWithoutTimestamp(this.searchObject.startDate);
    this.searchObject.endDate = parseDateWithoutTimestamp(this.searchObject.endDate);
    this.$subscriptions.push(
      this._manpowerFeedService.getAwardTriggerDetails(this.searchObject).subscribe((data: any) => {
        this.awardRetriggerList = data;
        this.pageCount = data.pageCount;
      }, err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching award list for retrigger failed. Please try again.');
      }
      )
    );
  }

  public openFeedRow(index, awardNumber): void {
    if (this.isFeedExpand[index]) {
      this.isFeedExpand[index] = !this.isFeedExpand[index];
    } else {
      this.isFeedExpand = [];
      this.positionDetails = [];
      this.feedError = [];
      this.positionReqInterfaceError = [];
      this.isFeedExpand[index] = true;
      this.selectedTab = 'award_interface';
      this.fetchErrorData(awardNumber);
      this.awardNumber = awardNumber;
    }
    scrollIntoView(index + '');
  }

  public retriggerAllAwardManpowerInterface(): void {
    const awardNumber = this.retriggerAwardNumber;
    this.$subscriptions.push(this._manpowerFeedService.retriggerAllAwardManpowerInterface({ awardNumber }).subscribe(
      (data: any) => {
        this.awardRetriggerList.workdayInterfaceLogDtos[this.awardRetriggerIndex].isReInterfaceNeeded = data.isReInterfaceNeeded;
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Re-Triggered Successfully');
        this.clearAwardTriggerData();
      },
      err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Re-Triggering Failed');
        this.clearAwardTriggerData();
      }));
  }

  public clearAwardTriggerData(): void {
    this.awardRetriggerIndex = null;
    this.retriggerAwardNumber = null;
    this.userAction = null;
    $('#award_retrigger_modal').modal('hide');
  }

  public fetchErrorData(awardNumber): void {
    this.feedError = [];
    this.positionDetails = [];
    this.positionReqInterfaceError = [];
    const tabName = this.tabNameMap[this.selectedTab];
    const REQUEST_DATA = { tabName, awardNumber };
    this.$subscriptions.push(this._manpowerFeedService.getAwardManpowerErrors(REQUEST_DATA).subscribe(
      data => {
        if (this.selectedTab === 'award_interface') {
          this.feedError = data;
        }
        if (this.selectedTab === 'position_request_interface') {
          this.positionDetails = data;
          if (this.positionDetails.length) {
            this.ID = this.positionDetails[0];
            this.getPositionErrorDetails(this.ID.resourceUniqueId);
          }
        }
      },
      err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching award data for retrigger failed. Please try again.');
      }));
  }

  public getPositionErrorDetails(resourceUniqueId): void {
    this.resourceUniqueId = resourceUniqueId;
    const REQUEST_DATA = { resourceUniqueId };
    this.$subscriptions.push(this._manpowerFeedService.getPositionErrorDetails(REQUEST_DATA).subscribe(
      (data: any) => {
        if (data) {
          this.positionReqInterfaceError = data.workdayInterfaceLogDtos;
        }
      },
      err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching Position Request Interface data for retrigger failed. Please try again.');
      }));
  }

  public reTrigger() {
    this.selectedTab == 'award_interface' ? this.retriggerAwardWorkdayPrerequisite() :  this.retriggerWorkdayApi();
    
  }

  public retriggerRequestObject(): any {
    return {
      workdayManpowerInterfaceId: this.workdayManpowerInterfaceId,
      comments: this.actionComment,
      manpowerUserActionCode: this.userAction.manpowerUserActionCode,
      startDate: this.searchObject.startDate,
      endDate: this.searchObject.endDate,
      awardNumber: this.searchObject.awardNumber,
      currentPage: this.searchObject.currentPage,
      itemsPerPage: this.searchObject.itemsPerPage,
      isDownload: this.searchObject.isDownload
    };
  }

  public retriggerAwardWorkdayPrerequisite(): void {
    if (this.validateComment()) {
      this.$subscriptions.push(
        this._manpowerFeedService.retriggerAwardWorkdayPrerequisite(this.retriggerRequestObject())
          .subscribe((data: any) => {
            this.feedError = data.workdayInterfaceLogDtos;
            this.awardRetriggerList.pageCount = data.pageCount;
            this.awardRetriggerList.itemsPerPage = data.itemsPerPage;
            this.awardRetriggerList.currentPage = data.currentPage;
            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Re-Triggered Successfully');
            this.changeIsReInterfaceNeededFlag(this.awardNumber, data.isReInterfaceNeeded);
            this.clearAPIData();
          }, err => {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Re-triggering Failed.');
            this.clearAPIData();
          })
      );
    }
  }

  public clearAPIData(): void {
    this.manualUpdateIndex = null;
    this.workdayManpowerInterfaceId = null;
    this.userAction = null;
    this.actionComment = null;
    this.validationMap.clear();
    $('#syncAwardManpowerAPI').modal('hide');
  }


  public updateManpowerInterfaceManually(): void {
    if (this.validateComment()) {
      this.$subscriptions.push(
        this._manpowerFeedService.updateManpowerInterfaceManually({
          workdayManpowerInterfaceId: this.workdayManpowerInterfaceId,
          comments: this.actionComment,
          manpowerUserActionCode: this.userAction.manpowerUserActionCode,
          tabName: this.selectedTab,
          awardNumber: this.awardNumber,
          resourceUniqueId: this.selectedTab != 'award_interface' ? this.resourceUniqueId : ''
        }).subscribe((data: any) => {
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Successfully Updated Manually');
          this.selectedTab == 'award_interface' ? this.updateManualProcessData(data) : this.updateManualProcessPositionData(data);
          this.changeIsReInterfaceNeededFlag(this.awardNumber, data.isReInterfaceNeeded);
          this.clearAPIData();
        }, err => {
          this._commonService.showToast(HTTP_ERROR_STATUS, 'Updating manpower interface failed. Please try again.');
          this.clearAPIData();
        })
      );
    }
  }


  changeIsReInterfaceNeededFlag(awardNumber: string, isReInterfaceNeeded: boolean): void {
     this.awardRetriggerList.workdayInterfaceLogDtos.find((x) => {
      return x.awardNumber == awardNumber;
    }).isReInterfaceNeeded = isReInterfaceNeeded;
  }

  updatePositionIdOnPositionDetailsArray(resourceUniqueId: string, positionId: string): void {
    this.positionDetails.find((el) => {
      return el.resourceUniqueId == resourceUniqueId;
    }).positionId = positionId;
  }

  public updateManualProcessData(data: any): void {
    this.feedError = data.workdayInterfaceLogDtos;
  }

  public callSyncAPI(person: any, actionCode: string): void {
    this.selectUserAction(actionCode);
    this.retriggerObject = person;
    $('#syncAwardManpowerAPI').modal('show');
  }

  public retriggerWorkdayApi(): void {
    if (this.validateComment()) {
      this.$subscriptions.push(
        this._manpowerFeedService.retriggerWorkdayApi(this.requestObject())
          .subscribe((_data: any) => {
            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Re-Triggered Successfully');
            this.positionReqInterfaceError = _data.workdayInterfaceLogDtos;
            if (_data.positionId) {
              this.positionReqInterfaceError.positionId = _data.positionId;
            }
            this.changeIsReInterfaceNeededFlag(this.awardNumber, _data.isReInterfaceNeeded);
            this.updatePositionIdOnPositionDetailsArray(_data.resourceUniqueId, _data.positionId);
            this.clearAPIData();
            // this._commonService.isManualLoaderOn = true;
            // this.getCostAllocationTriggerDetails(this.allocationRetriggerList.currentPage);
          }, err => {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching manpower retrigger list failed. Please try again.');
            this.clearAPIData();
          }
          )
      );
    }
  }

  public validateComment(): boolean {
    this.validationMap.clear();
    if (!this.actionComment) {
      this.validationMap.set('comment', 'Enter comment');
    }
    return this.validationMap.size ? false : true;
  }

  public updateManualProcessPositionData(data): void {
    this.positionReqInterfaceError = data.workdayInterfaceLogDtos;
  }

  public requestObject(): any {
    return {
      workdayManpowerInterfaceId: this.retriggerObject.workdayManpowerInterfaceId,
      manpowerLogId: this.retriggerObject.manpowerLogId,
      comments: this.actionComment,
      manpowerUserActionCode: this.userAction.manpowerUserActionCode
    };
  }



  // pagination
  public actionsOnPageChange(event): any {
    this.isFeedExpand = [];
    this.searchObject.currentPage = event;
    this.fetchAwardRetriggerList(event);
    scrollIntoView('pageScrollToTop', 'start');
  }

  getStatusIconForCode(code): String  {
    switch (code) {
      case '1' : return 'fa-check-circle text-success';         // Success
      case '2' : return 'fa-times-circle text-danger';          // Error
      case '3' : return 'fa-clock-o text-warning';              // Pending
      case '4' : return 'fas fa-circle text-info';              // Feed not required
      case '5' : return 'fa-exclamation-circle text-warning';   // Re-triggered
      default : return '';
    }
  }
}
