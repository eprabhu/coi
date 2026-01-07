import { Component, OnInit  } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { SponsorReportService } from './sponsor-report.service';
import { CommonService } from '../../common/services/common.service';
import { setFocusToElement } from '../../common/utilities/custom-utilities';
import { getEndPointOptionsForSponsor } from '../../common/services/end-point.config';
import {  SearchReportingRequirement } from './sponsor-report-interface';
import { getDateStringFromTimeStamp } from '../../common/utilities/date-utilities';

declare var $;
@Component({
  selector: 'app-sponsor-report',
  templateUrl: './sponsor-report.component.html',
  styleUrls: ['./sponsor-report.component.css']
})
export class SponsorReportComponent implements OnInit {

  userActivity = { loginStatus: '', endDate: '', startDate: '' };
  reportTermsLookup: any = {};
  setFocusToElement = setFocusToElement;
  getDateStringFromTimeStamp = getDateStringFromTimeStamp;
  sponsorSearchOptions: any = {};
  clearField: String;
  searchObj = new SearchReportingRequirement();
  index;
  sponsorReports;
  sponsorFundingSchemes: any;
  numbers = interval(1000);
  result: any;
  reportTypes: any;
  isApplicationAdministrator: any;
  deleteIndex;
  $subscriptions: Subscription[] = [];

  constructor(private _sponsorReportService: SponsorReportService, public _commonService: CommonService) { }

  ngOnInit() {
    this.getLookupData();
    this.sponsorSearchOptions = getEndPointOptionsForSponsor();
    this.fetchAllSponsorReports();
    this.getPermissions();
  }

  private async getPermissions() {
    this.isApplicationAdministrator = await this._commonService.checkPermissionAllowed('APPLICATION_ADMINISTRATOR');
  }

  clearSearchObj() {
    this.clearField = new String('true');
    this.searchObj = new SearchReportingRequirement();
    this.fetchAllSponsorReports();
  }

  openDeleteModal(i) {
    this.index = i;
    $('#delete-modal').modal('show');
  }


  public fetchAllSponsorReports() {
    this.$subscriptions.push(this._sponsorReportService.fetchAllSponsorReport(this.searchObj)
      .subscribe((result: any) => {
        this.result = result;
        this.sponsorReports = result.sponsorReports;
      }));
  }

  getLookupData() {
    this.$subscriptions.push(this._sponsorReportService.reportsTermsLookUpData(null)
      .subscribe((result: any) => {
        this.reportTermsLookup = result;
      }));
  }

  onSponsorSelect(event) {
    this.searchObj.sponsorCode = (event == null) ? '' : event.sponsorCode;
    if (event == null) {
      this.sponsorFundingSchemes = null;
      this.searchObj.fundingSchemeId = null;
    }else {
      this.fetchFundingScheme();
    }
  }

  modalAction(report, flag) {
    if (flag === 'add') {
      this._sponsorReportService.$modalAction.next({action: 'add', reportData: report});
    }
    if (flag === 'update') {
      this._sponsorReportService.$modalAction.next({action: 'update', reportData: report});
    }
    if (flag === 'view') {
      this._sponsorReportService.$modalAction.next({action: 'view', reportData: report});
    }
  }

  deleteSponsorReport(): void {
   this.$subscriptions.push(this._sponsorReportService.deleteSponsorReport(this.sponsorReports[this.index].sponsorReportId)
        .subscribe((data: any) => {
          this.sponsorReports.splice(this.index, 1);
        }));
  }

  addOrUpdate(report): void {
    this.fetchAllSponsorReports();
  }

  actionsOnPageChange(pageNumber: number) {
    this.searchObj.currentPage = pageNumber;
    this.fetchAllSponsorReports();
  }

  fetchFundingScheme() {
    if (this.searchObj.sponsorCode && this.searchObj.sponsorCode !== 'null') {
      this.$subscriptions.push(this._sponsorReportService.fetchFundingSchemeBySponsor({ 'sponsorCode': this.searchObj.sponsorCode })
        .subscribe((data: any) => {
          this.sponsorFundingSchemes = data.sponsorFundingSchemes ? data.sponsorFundingSchemes : null ;
        }));
    }
  }

   getMonthName(monthNumber) {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('en-US', { month: 'long' });
  }

  fetchReportType() {
    if (this.searchObj.reportClassCode && this.searchObj.reportClassCode !== 'null') {
      this.$subscriptions.push(this._sponsorReportService.fetchReportTypeByReportClass(this.searchObj.reportClassCode)
        .subscribe((data: any) => {
          this.reportTypes = data ? data : null;
        }));
    } else {
      this.reportTypes = null;
      this.searchObj.reportCode = null;
    }
  }
}
