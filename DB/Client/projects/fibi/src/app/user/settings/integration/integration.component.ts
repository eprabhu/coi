import { Component, OnInit } from '@angular/core';
import { SettingsServiceService } from '../settings-service.service';
import { CommonService } from '../../../common/services/common.service';
import { HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS } from '../../../app-constants';
import { parseDateWithoutTimestamp } from '../../../common/utilities/date-utilities';
import { setFocusToElement } from '../../../common/utilities/custom-utilities';
declare var $: any;

@Component({
  selector: 'app-integration',
  templateUrl: './integration.component.html',
  styleUrls: ['./integration.component.css']
})
export class IntegrationComponent implements OnInit {

  sapBatchId: any;
  integrationOperation: any;
  icsDate :any;
  planICSStartDate :any;
  planICSEndDate :any;
  planCAStartDate: any;
  planCAEndDate: any;
  setFocusToElement = setFocusToElement;
  processingType = 'REVENUE';
  awardNumber: string;
  constructor(private _settingsService: SettingsServiceService, public _commonService: CommonService) { }

  ngOnInit() {
  }

  migrateAttachmentData() {
    this._settingsService.migrateAttachmentData().subscribe(
      (data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Attachment data migrated successfully .');
      });
  }
  fastIntegrationResponceProcessing() {
    this._settingsService.fastIntegrationResponceProcessing().subscribe(
      (data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Fast Integration Template ResponSe Processing completed successfully .');
      });
  }
  fastIntegration() {
    this._settingsService.fastIntegration({
      'sapAwardFeeds': null,
      'sapFeedMaintenanceVO': null
    }).subscribe(
      (data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Fast Integration Template Creation completed successfully .');
      });
  }
  fastIntegrationExpenseTransactionRTProcessing() {
    this._settingsService.fastIntegrationExpenseTransactionRTProcessing().subscribe(
      (data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Fast Integration Expense Transaction RT completed processing .');
      });
  }
  downloadFile(fileName, data) {
    if ((window.navigator as any).msSaveOrOpenBlob) {
      (window.navigator as any).msSaveBlob(new Blob([data.body], { type: 'xlsx' }),
        fileName.toLowerCase() + '.' + 'xlsx');
    } else {
      const DOWNLOAD_BTN = document.createElement('a');
      DOWNLOAD_BTN.href = URL.createObjectURL(data.body);
      DOWNLOAD_BTN.download = fileName.toLowerCase() + '.' + 'xlsx';
      document.body.appendChild(DOWNLOAD_BTN);
      DOWNLOAD_BTN.click();
    }
  }
  exportExpenseTransactionReport() {
    this._settingsService.exportExpenseTransactionReport().subscribe(
      (data: any) => {
        const fileName = 'exportExpenseTransactionReport';
        // msSaveOrOpenBlob only available for IE & Edge
        if ((window.navigator as any).msSaveOrOpenBlob) {
          (window.navigator as any).msSaveBlob(new Blob([data.body], { type: 'xlsx' }),
            fileName.toLowerCase() + '.' + 'xlsx');
        } else {
          const DOWNLOAD_BTN = document.createElement('a');
          DOWNLOAD_BTN.href = URL.createObjectURL(data.body);
          DOWNLOAD_BTN.download = fileName.toLowerCase() + '.' + 'xlsx';
          document.body.appendChild(DOWNLOAD_BTN);
          DOWNLOAD_BTN.click();
        }
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'To export expense Transaction Report.');
      });
  }
  exportLevelOneExpenseTransactionReport() {
    this._settingsService.exportLevelOneExpenseTransactionReport().subscribe(
      (data: any) => {
        const fileName = 'exportLevelOneExpenseTransactionReport';
        // msSaveOrOpenBlob only available for IE & Edge
        if ((window.navigator as any).msSaveOrOpenBlob) {
          (window.navigator as any).msSaveBlob(new Blob([data.body], { type: 'xlsx' }),
            fileName.toLowerCase() + '.' + 'xlsx');
        } else {
          const DOWNLOAD_BTN = document.createElement('a');
          DOWNLOAD_BTN.href = URL.createObjectURL(data.body);
          DOWNLOAD_BTN.download = fileName.toLowerCase() + '.' + 'xlsx';
          document.body.appendChild(DOWNLOAD_BTN);
          DOWNLOAD_BTN.click();
        }
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'To export level 1 expense Transaction Report.');
      });
  }
  exportLevelTwoExpenseTransactionReport() {
    this._settingsService.exportLevelTwoExpenseTransactionReport().subscribe(
      (data: any) => {
        const fileName = 'exportLevelTwoExpenseTransactionReport';
        // msSaveOrOpenBlob only available for IE & Edge
        if ((window.navigator as any).msSaveOrOpenBlob) {
          (window.navigator as any).msSaveBlob(new Blob([data.body], { type: 'xlsx' }),
            fileName.toLowerCase() + '.' + 'xlsx');
        } else {
          const DOWNLOAD_BTN = document.createElement('a');
          DOWNLOAD_BTN.href = URL.createObjectURL(data.body);
          DOWNLOAD_BTN.download = fileName.toLowerCase() + '.' + 'xlsx';
          document.body.appendChild(DOWNLOAD_BTN);
          DOWNLOAD_BTN.click();
        }
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'To export level 2 expense Transaction Report.');
      });
  }
  exportSapFeedReport() {
    this._settingsService.exportSapFeedReport(this.sapBatchId).subscribe(
      (data: any) => {
        this.downloadFile('sapfeedreport', data);
        // this.downloadFile('sapfeedbudgetreport', data);
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'SAP Report.');
      });
  }
  fastIntegrationRevenueTransactionRTProcessing() {
    this._settingsService.fastIntegrationRevenueTransactionRTProcessing(this.processingType).subscribe(
      (data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Fast Integration Revenue Transaction RT completed processing .');
      });
  }
  exportRevenueTransactionReport() {
    this._settingsService.exportRevenueTransactionReport().subscribe(
      (data: any) => {
        this.downloadFile('exportRevenueTransactionReport', data);
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'To export revenue Transaction Report.');
      });
  }
  exportLevelOneRevenueTransactionReport() {
    this._settingsService.exportLevelOneRevenueTransactionReport().subscribe(
      (data: any) => {
        this.downloadFile('exportLevelOneRevenueTransactionReport', data);
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'To export level 1 revenue Transaction Report.');
      });
  }
  exportLevelTwoRevenueTransactionReport() {
    this._settingsService.exportLevelTwoRevenueTransactionReport().subscribe(
      (data: any) => {
        this.downloadFile('exportLevelTwoRevenueTransactionReport', data);
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'To export level 2 revenue Transaction Report.');
      });
  }
  grantCallAttachmentDataMigration() {
    this._settingsService.grantCallAttachmentDataMigration().subscribe(
      (data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Attachment data migrated successfully .');
      });
  }
  dailySynchronization() {
    this._settingsService.dailySynchronization().subscribe(
      (data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Daily Syncing Completed.');
      });
  }
  workDayManpower() {
    this._settingsService.workDayManpower().subscribe(
      (data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'WORKDAY Manpower Done.');
      });
  }
  workDayCitizenship() {
    this._settingsService.workDayCitizenship().subscribe(
      (data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'WORKDAY Citizenship Done.');
      });
  }
  workDayCostAllocation() {
    this._settingsService.workDayCostAllocation().subscribe(
      (data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'WORKDAY Cost Allocation Done.');
      });
  }
  workDayTermination() {
    this._settingsService.workDayTermination().subscribe(
      (data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'WORKDAY Termination Done.');
      });
  }
  workDayLongLeave() {
    this._settingsService.workDayLongLeave().subscribe(
      (data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'WORKDAY Long Leave Done.');
      });
  }
  workDayCostReconciliation() {
    this._settingsService.workDayCostReconciliation().subscribe(
      (data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'WORKDAY Cost Reconciliation Done.');
      });
  }
  workDayClosePosition() {
    this._settingsService.workDaycClosePosition().subscribe(
      (data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'WORKDAY Close Position Done.');
      });
  }
  workDayJobProfile() {
    this._settingsService.workDayJobProfile().subscribe(
      (data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'WORKDAY Job Profile Done.');
      });
  }
  exportManpowerDetails() {
    this._settingsService.exportManpowerDetails().subscribe(
      (data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Manpower Details exported.');
      });
  }
  getJobProfileChanges() {
    this._settingsService.getJobProfileChanges().subscribe(
      (data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Designation Changes Mail has been sent.');
      });
  }
  getStudentIcsIntegration() {
    this.planICSStartDate = parseDateWithoutTimestamp(this.planICSStartDate);
    this.planICSEndDate = parseDateWithoutTimestamp(this.planICSEndDate);
    const property1 = {
      "property1": this.planICSStartDate,
      "property2": this.planICSEndDate
    }
        this._settingsService.getStudentIcsIntegration(property1).subscribe(
      (data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Student ICS Integration Completed.');
      });
  }
  updateClaimDuration() {
    this._settingsService.updateClaimDuration().subscribe(
      (data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Updated Claim Duration.');
      });
  }
  encryptMigrationCitizenshipNationality() {
    this._settingsService.encryptMigrationCitizenshipNationality().subscribe(
      (data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Encrypted citizenship and nationality successfully');
      });
  }
  claimInvoiceSapIntegration() {
    this._settingsService.claimInvoiceSapIntegration().subscribe(
      (data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Claim Invoice Sap File Generated.');
      });
  }
  processClaimInvoiceFeedResponse() {
    this._settingsService.processClaimInvoiceFeedResponse().subscribe(
      (data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Claim Invoice Feed Response Processed .');
      });
  }
  ardpBudgetIntegration() {
    this._settingsService.ardpBudgetIntegration().subscribe(
      (data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Claim Invoice Sap File Generated.');
      });
  }
  scopusIntegration() {
    this._settingsService.scopusIntegration().subscribe(
      (data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Claim Invoice Feed Response Processed .');
      });
  }

  profitCenter() {
    this._settingsService.profitCenter().subscribe(
      (data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Profit center synced successfully .');
      });
  }

  fundCenter() {
    this._settingsService.fundCenter().subscribe(
      (data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Fund center synced successfully .');
      });
  }

  costCenter() {
    this._settingsService.costCenter().subscribe(
      (data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Cost center synced successfully .');
      });
  }

  grantCode() {
    this._settingsService.grantCode().subscribe(
      (data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Grant code synced successfully .');
      });
  }

  positionStatusApi() {
    this._settingsService.positionStatusApi().subscribe(
      (data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Job requisition synced successfully .');
      });
  }

  costAllocation() {
    this._settingsService.costAllocation().subscribe(
      (data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Cost allocation synced successfully .');
      });
  }

  costAllocationWithManualDates() {
    this.planCAStartDate = parseDateWithoutTimestamp(this.planCAStartDate);
    this.planCAEndDate = parseDateWithoutTimestamp(this.planCAEndDate);
    const reqObj = {
      'property1': this.planCAStartDate,
      'property2': this.planCAEndDate
    };

    this._settingsService.costAllocationWithManualDates(reqObj).subscribe(
      (data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Cost allocation synced successfully .');
      });
  }

  updateFeedStatusManually() {
    this.awardNumber = !this.awardNumber ? null : this.awardNumber;
    this._settingsService.updateFeedStatusManually(this.awardNumber).subscribe(
      (data: string) => {
        if (data && data == "Success") {
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Updated Feed status successfully.');
        } else {
          this._commonService.showToast(HTTP_ERROR_STATUS, 'Updating Feed status failed. Please try again.');
        }  
      });
  }

  switchFunctions() {
    switch (this.integrationOperation) {
      case 1: { this.migrateAttachmentData(); break; }
      case 2: { this.fastIntegration(); break; }
      case 3: { this.fastIntegrationResponceProcessing(); break; }
      case 4: { this.fastIntegrationExpenseTransactionRTProcessing(); break; }
      case 5: { this.fastIntegrationRevenueTransactionRTProcessing(); break; }
      case 6: { this.exportExpenseTransactionReport(); break; }
      case 7: { this.exportLevelOneExpenseTransactionReport(); break; }
      case 8: { this.exportLevelTwoExpenseTransactionReport(); break; }
      case 9: { this.exportRevenueTransactionReport(); break; }
      case 10: { this.exportLevelOneRevenueTransactionReport(); break; }
      case 11: { this.exportLevelTwoRevenueTransactionReport(); break; }
      case 12: { this.grantCallAttachmentDataMigration(); break; }
      case 13: { this.dailySynchronization(); break; }
      case 14: { this.workDayManpower(); break; }
      case 15: { this.workDayCitizenship(); break; }
      case 16: { this.workDayCostAllocation(); break; }
      case 17: { this.workDayTermination(); break; }
      case 18: { this.workDayLongLeave(); break; }
      case 19: { this.workDayCostReconciliation(); break; }
      case 20: { this.workDayClosePosition(); break; }
      case 21: { this.workDayJobProfile(); break; }
      case 22: { this.exportManpowerDetails(); break; }
      case 23: { this.getJobProfileChanges(); break; }
      case 24: { this.getStudentIcsIntegration(); break; }
      case 25: {this.encryptMigrationCitizenshipNationality(); break; }
      case 26: {this.updateClaimDuration(); break; }
      case 27: {this.claimInvoiceSapIntegration(); break; }
      case 28: {this.processClaimInvoiceFeedResponse(); break; }
      case 29: {this.ardpBudgetIntegration(); break; }
      case 30: {this.scopusIntegration(); break; }
      case 31: {this.profitCenter(); break; }
      case 32: {this.fundCenter(); break; }
      case 33: {this.costCenter(); break; }
      case 34: {this.grantCode(); break; }
      case 35: {this.positionStatusApi(); break; }
      case 36: {this.costAllocation(); break; }
      case 37: {this.costAllocationWithManualDates(); break; }
      case 38: {this.updateFeedStatusManually(); break; }
    }
  }

}
