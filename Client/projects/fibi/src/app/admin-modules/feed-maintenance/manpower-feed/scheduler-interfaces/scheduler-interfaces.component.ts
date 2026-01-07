import { Component, OnInit, OnDestroy } from '@angular/core';
import { ManpowerFeedService } from '../manpower-feed.service';
import { ManpowerInterface, ManpowerLogDetailsReqObj } from '../manpower-feed.interface';
import { Subscription } from 'rxjs';
import { CommonService } from '../../../../common/services/common.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../../app-constants';
import { DateParserService } from '../../../../common/services/date-parser.service';
import { DateFormatPipe } from '../../../../shared/pipes/custom-date.pipe';
import { setFocusToElement } from '../../../../common/utilities/custom-utilities';
import { parseDateWithoutTimestamp } from '../../../../common/utilities/date-utilities';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';


declare var $: any;
@Component({
  selector: 'app-scheduler-interfaces',
  templateUrl: './scheduler-interfaces.component.html',
  styleUrls: ['./scheduler-interfaces.component.css'],
  providers: [DateParserService]
})
export class SchedulerInterfacesComponent implements OnInit, OnDestroy {

  selectedTab = '';
  schedulerDetails = [];
  manpowerInterfaces: ManpowerInterface[] = [];
  $subscriptions: Subscription[] = [];
  StartDate: any;
  EndDate: any;
  setFocusToElement = setFocusToElement;
  map = new Map();
  startDateSearch: any;
  endDateSearch: any;

  constructor(private _manpowerFeedService: ManpowerFeedService,
    public _commonService: CommonService, public dateFormatter: DateParserService) { }

  ngOnInit() {
    this.fetchInterfaceApi();
    this.setDateObj();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  private fetchInterfaceApi(): void {
    this.$subscriptions.push(
      this._manpowerFeedService.getManpowerLookupSyncDetails({}).subscribe((data: any) => {
        this.manpowerInterfaces = data;
        this.selectedTab = this.manpowerInterfaces[0].interfaceTypeCode ? this.manpowerInterfaces[0].interfaceTypeCode : '';
        this.getManpowerLogDetail(this.selectedTab);
      }, err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching manpower failed. Please try again.'); }
      )
    );
  }

  getManpowerLogDetail(interfaceTypeCode: string, flag: string = ''): void {
    let reqObj: ManpowerLogDetailsReqObj;

    if (flag === 'search') {
      this.startDateSearch = parseDateWithoutTimestamp(this.startDateSearch);
      this.endDateSearch = parseDateWithoutTimestamp(this.endDateSearch);
      reqObj = {
        manpowerInterfaceTypeCode: interfaceTypeCode,
        schedulerInterfaceFrom: this.startDateSearch,
        schedulerInterfaceTo: this.endDateSearch
      };
    } else {
      reqObj = {
        manpowerInterfaceTypeCode: interfaceTypeCode,
        ...this.setDateObj()
      };
    }

    this.$subscriptions.push(
      this._manpowerFeedService.getManpowerLogDetail(reqObj).subscribe((data: any) => {
        this.schedulerDetails = data.manpowerLogDetails;
      }, err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching manpower failed. Please try again.'); }
      )
    );
  }

  private setDateObj(bufferDays: number = 30): ManpowerLogDetailsReqObj {
    const newDate = new Date();
    const currentDate = JSON.parse(JSON.stringify(newDate));
    newDate.setDate(newDate.getDate() - bufferDays);
    const NEW_DATE = new Date(newDate.setHours(0, 0, 0, 0));
    this.startDateSearch = parseDateWithoutTimestamp(NEW_DATE);
    this.endDateSearch = parseDateWithoutTimestamp(currentDate);
    return  {
      schedulerInterfaceFrom: this.startDateSearch,
      schedulerInterfaceTo: this.endDateSearch
    };
  }

  clearSearch(): void {
    this.setDateObj();
  }

  syncAPI(): void {
    switch (this.selectedTab) {
      case '9': this.getManpowerDetails();
        break;
      case '10': this.getNationalityDetails();
        break;
      case '11': this.reconcileCostAllocation();
        break;
      case '12': this.startWorkdayLongLeaveWithManualDates();
        break;
      case '13': this.startWorkdayTerminationsWithManualDates();
        break;
      case '15': this.getJobProfileChanges();
        break;
      case '16': this.getWorkdayJobProfile();
        break;
      case '2': this.costAllocationWithManualDates();
        break;
      case '18': this.positionStatusApiWithManualDates();
        break;
      default: return;
    }
  }

  private getWorkdayJobProfile(): void {
    this.$subscriptions.push(
      this._manpowerFeedService.getWorkdayJobProfile().subscribe((data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Workday Job Profile Successfully synced.');
      }, err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Updating Workday Job Profile failed. Please try again.'); }
      ));
  }

  private getManpowerDetails(): void {
    this.$subscriptions.push(
      this._manpowerFeedService.getManpowerDetails().subscribe((data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Workday Manpower Details Successfully synced.');
        this.getManpowerLogDetail(this.selectedTab, 'search');
      }, err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Updating Workday Manpower Details failed. Please try again.'); }
      ));
  }

  private getNationalityDetails(): void {
    this.$subscriptions.push(
      this._manpowerFeedService.getNationalityDetails().subscribe((data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Workday Nationality Details Successfully synced.');
        this.getManpowerLogDetail(this.selectedTab, 'search');
      }, err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Updating Workday Nationality Details failed. Please try again.'); }
      ));
  }

  private getJobProfileChanges(): void {
    this.$subscriptions.push(
      this._manpowerFeedService.getJobProfileChanges().subscribe((data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Workday Job Profile Successfully synced.');
        this.getManpowerLogDetail(this.selectedTab, 'search');
      }, err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Updating Workday Job Profile failed. Please try again.'); }
      ));
  }


  private reconcileCostAllocation(): void {
    this.$subscriptions.push(
      this._manpowerFeedService.reconcileCostAllocation().subscribe((data: any) => {
        $('#ConfirmModal').modal('hide');
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Workday cost allocations reconciliation completed successfully.');
        this.getManpowerLogDetail(this.selectedTab, 'search');
      }, err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Workday cost allocations reconciliation failed. Please try again.');
      }
      ));
  }

  costAllocationWithManualDates(): void {
    if (this.dateValidation()) {
      this.StartDate = parseDateWithoutTimestamp(this.StartDate);
      this.EndDate = parseDateWithoutTimestamp(this.EndDate);
      const reqObj = {
        'property1': this.StartDate,
        'property2': this.EndDate,
      };

      this._manpowerFeedService.costAllocationWithManualDates(reqObj).subscribe(
        (data: any) => {
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Cost allocation triggered successfully .');
          $('#ConfirmModal').modal('hide');
          this.StartDate = this.EndDate = null;
          this.getManpowerLogDetail(this.selectedTab, 'search');
        }, err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Triggering Cost Allocations failed. Please try again.'); }
      );
    }
  }

  positionStatusApiWithManualDates(): void {
    if (this.dateValidation()) {
      this.StartDate = parseDateWithoutTimestamp(this.StartDate);
      this.EndDate = parseDateWithoutTimestamp(this.EndDate);
      const reqObj = {
        'property1': this.StartDate,
        'property2': this.EndDate,
      };
      this._manpowerFeedService.positionStatusApiWithManualDates(reqObj).subscribe(
        (data: any) => {
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Job requisition triggered successfully .');
          $('#ConfirmModal').modal('hide');
          this.StartDate = this.EndDate = null;
          this.getManpowerLogDetail(this.selectedTab, 'search');
        }, err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Triggering Job requisition failed. Please try again.'); }
      );
    }
  }

  startWorkdayLongLeaveWithManualDates(): void {
    if (this.dateValidation()) {
      this.StartDate = parseDateWithoutTimestamp(this.StartDate);
      this.EndDate = parseDateWithoutTimestamp(this.EndDate);
      const reqObj = {
        'property1': this.StartDate,
        'property2': this.EndDate,
      };
      this._manpowerFeedService.startWorkdayLongLeaveWithManualDates(reqObj).subscribe(
        (data: any) => {
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Workday long leave triggered successfully.');
          $('#ConfirmModal').modal('hide');
          this.StartDate = this.EndDate = null;
          this.getManpowerLogDetail(this.selectedTab, 'search');
        }, err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Triggering Workday long leave failed. Please try again.'); });
    }
  }

  startWorkdayTerminationsWithManualDates(): void {
    if (this.dateValidation()) {
      this.StartDate = parseDateWithoutTimestamp(this.StartDate);
      this.EndDate = parseDateWithoutTimestamp(this.EndDate);
      const reqObj = {
        'property1': this.StartDate,
        'property2': this.EndDate,
      };
      this._manpowerFeedService.startWorkdayTerminationsWithManualDates(reqObj).subscribe(
        (data: any) => {
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Workday termination triggered successfully .');
          $('#ConfirmModal').modal('hide');
          this.getManpowerLogDetail(this.selectedTab, 'search');
          this.StartDate = this.EndDate = null;
        }, err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Triggering Workday termination failed. Please try again.'); });
    }
  }

  private dateValidation(): Boolean {
    this.map.clear();
    if (!this.StartDate) {
      this.map.set('StartDate', '*Enter Start Date');
    }
    if (!this.EndDate) {
      this.map.set('EndDate', '*Enter End Date');
    }
    return this.map.size === 0;
  }

  clearModalData(): void {
    this.StartDate = this.EndDate = null;
  }
}
