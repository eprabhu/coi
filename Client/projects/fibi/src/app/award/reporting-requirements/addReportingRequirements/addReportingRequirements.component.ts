import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { ReportingRequirementsService } from '../reporting-requirements.service';
import { CommonService } from '../../../common/services/common.service';
import { CommonDataService } from '../../services/common-data.service';
import { DEFAULT_DATE_FORMAT, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { ElasticConfigService } from '../../../common/services/elastic-config.service';
import {
  compareDatesWithoutTimeZone,
  getDateObjectFromTimeStamp,
  parseDateWithoutTimestamp
} from '../../../common/utilities/date-utilities';
import { setFocusToElement, setHelpTextForSubItems } from '../../../common/utilities/custom-utilities';
import { ReportingRequirement } from '../reporting-requirements-interface';

declare var $;

@Component({
  selector: 'app-addReportingRequirements',
  templateUrl: './addReportingRequirements.component.html',
  styleUrls: ['./addReportingRequirements.component.css']
})
export class AddReportingRequirementsComponent implements OnInit, OnChanges {
  @Input() reportTermsLookup;
  @Input() isEditEnabledForSection;
  @Input() awardData: any;
  @Output() refreshData: any = new EventEmitter();
  isSaving: boolean;
  $subscriptions: any = [];
  awardReport: ReportingRequirement = new ReportingRequirement();
  clearRecipientField: String;
  elasticPersonSearchOptions;
  elasticSearchOptions;
  map: any = new Map();
  datePlaceHolder = DEFAULT_DATE_FORMAT;
  setFocusToElement = setFocusToElement;
  previewDates: number[] = [];
  showPreview: boolean;
  frequenciesChanged = false;
  selectedOption = 'onCustomDate';
  warningMsg: any;
  helpText: any = { report: { reportClassCode: null, reportCode: null, parentHelpTexts: [] } };
  cachedReportType = [];


  constructor(private _reportTermsService: ReportingRequirementsService,
    public _commonService: CommonService,
    public _commonData: CommonDataService,
    private _elasticConfig: ElasticConfigService) { }

  ngOnInit() {
    this.getHelpText();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.reportTermsLookup && changes.reportTermsLookup.currentValue) {
      this.awardReport.customEndDate = getDateObjectFromTimeStamp(this.reportTermsLookup.mapOfDates[4]);
    }
  }

  clearReportingRequirementObj() {
    this.awardReport = new ReportingRequirement();
    this.awardReport.customEndDate = getDateObjectFromTimeStamp(this.reportTermsLookup.mapOfDates[4]);
    this.selectedOption = 'onCustomDate';
    this.map.clear();
    this.previewDates = [];
  }

  isCustomDateOrOccurrence() {
    if (this.selectedOption === 'onCustomDate') {
      this.awardReport.occurrence = 0;
    }
    if (this.selectedOption === 'occurrence') {
      this.awardReport.customEndDate = getDateObjectFromTimeStamp(this.reportTermsLookup.mapOfDates[4]);
    }
  }


  saveReports() {
    if (this.reportsValidation() && !this.isSaving) {
      this.saveCurrentReport(this.setRequestObject());
    }
  }

  reportsValidation() {
    this.map.clear();
    const awardBeginDate = getDateObjectFromTimeStamp(this._commonData.beginDate);
    const awardFinalExpirationDate = getDateObjectFromTimeStamp(this._commonData.finalExpirationDate);
    if (!this.awardReport.reportClassCode ) {
      this.map.set('class', 'Please select a report class.');
    }
    if (!this.awardReport.frequencyCode ) {
      this.map.set('frequencyCode', 'Please select a frequency code.');
    }
    if (!this.awardReport.frequencyBaseCode ) {
      this.map.set('frequencyBaseCode', 'Please select a frequency base code.');
    }
    if (!this.awardReport.baseDate ) {
      this.map.set('isFrequencyAsRequired', this.awardReport.frequencyBaseCode === '6' ?
        'Please add a base date' : 'Base date cannot be empty. Please select a valid frequency base.');
    }
    if (this.awardReport.baseDate && compareDatesWithoutTimeZone(this.awardReport.baseDate, awardBeginDate) === -1) {
      this.map.set('isFrequencyAsRequired', 'Please add a base date after award start date.');
    }
    if (this.awardReport.baseDate && compareDatesWithoutTimeZone(this.awardReport.baseDate, awardFinalExpirationDate) === 1) {
      this.map.set('isFrequencyAsRequired', 'Please add a base date before award end date.');
    }
    if (this.awardReport.frequencyCode !== '14' && this.selectedOption === 'occurrence' &&
      (!this.awardReport.occurrence || this.awardReport.occurrence === 0)) {
      this.map.set('occurrence', 'Please enter number of occurrences.');
    }
    if (this.awardReport.frequencyCode !== '14' && this.selectedOption === 'onCustomDate'
      && (!this.awardReport.customEndDate || this.awardReport.customEndDate == null)) {
      this.map.set('customDate', 'Please add an report end date.');
    }
    if (this.awardReport.frequencyCode !== '14' && this.awardReport.customEndDate
      && this.awardReport.baseDate && (compareDatesWithoutTimeZone(this.awardReport.baseDate, this.awardReport.customEndDate) === 1)) {
      this.map.set('customDate', 'Please add an report end date after base date.');
    }
    return this.map.size < 1;
  }

  previewValidation(): boolean {
    this.map.clear();
    if (!this.awardReport.frequencyCode || this.awardReport.frequencyCode === 'null') {
      this.map.set('frequencyCode', 'Please select a frequency code');
    }
    if (!this.awardReport.baseDate || this.awardReport.baseDate === 'null') {
      this.map.set('isFrequencyAsRequired', this.awardReport.frequencyBaseCode === '6' ?
        'Please add a base date' : 'Base date cannot be empty. Please select a valid frequency base');
    }
    if (this.awardReport.frequencyCode !== '14' && this.selectedOption === 'occurrence'
      && (!this.awardReport.occurrence || this.awardReport.occurrence === 0)) {
      this.map.set('occurrence', 'Please enter number of occurrences');
    }
    if (this.awardReport.frequencyCode !== '14' && this.selectedOption === 'onCustomDate'
      && (!this.awardReport.customEndDate || this.awardReport.customEndDate == null)) {
      this.map.set('customDate', 'Please add an report end date');
    }
    if (this.awardReport.frequencyCode !== '14' && this.awardReport.customEndDate
      && this.awardReport.baseDate && (compareDatesWithoutTimeZone(this.awardReport.baseDate, this.awardReport.customEndDate) === 1)) {
      this.map.set('customDate', 'Please add an report end date after base date');
    }
    return this.map.size < 1;
  }


  saveCurrentReport(requestObj) {
    this.isSaving = true;
    this.$subscriptions.push(this._reportTermsService.maintainReports(requestObj)
      .subscribe((data: any) => {
        if (data.awardReport.awardReportTermsId) {
          this.awardReport = data.awardReport;
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Report saved successfully.');
          this.isSaving = false;
          this.clearReportingRequirementObj();
          this.refreshData.emit();
          $('#addReports').modal('hide');
        } else {
          this.isSaving = false;
          this.map.set('noDueDate', 'No due dates generated for this reporting start date and  reporting end date');
        }

      }, err => {
        this.isSaving = false;
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to save report, Please try again.');
      }));
  }

  setElasticOptions() {
    this.elasticSearchOptions = this._elasticConfig.getElasticForPerson();
  }

  setElasticForRecipients() {
    this.elasticPersonSearchOptions = this._elasticConfig.getElasticForPerson();
  }


  /* fetches report type based  report class */
  fetchReportType() {
    this.awardReport.reportCode = null;
    if (this.awardReport.reportClassCode && this.awardReport.reportClassCode !== null) {
      this.$subscriptions.push(this._reportTermsService.fetchReportTypeByReportClass(this.awardReport.reportClassCode)
        .subscribe((data: any) => {
          this.reportTermsLookup.reportList = data;
        }));
    }
  }

  /** When a frequency base is selected, frequency base code compares and set value to baseDate. */
  frequencyBaseChange() {
    this.map.delete('isFrequencyAsRequired');
    this.awardReport.baseDate = getDateObjectFromTimeStamp(this.reportTermsLookup.mapOfDates[this.awardReport.frequencyBaseCode]);
    if (this.awardReport.baseDate) {
      this.awardReport.baseDate = new Date(this.awardReport.baseDate);
    }
  }

  previewReport() {
    this.previewDates = [];
    if (this.previewValidation() && this.awardReport.frequencyCode !== '14') {
      const requestObj = this.setRequestObject();
      this.$subscriptions.push(this._reportTermsService.calculateOrGenerateOccurrence(requestObj).subscribe((data: any) => {
        if (data.previewDates.length !== 0) {
          this.previewDates = data.previewDates;
          this.showPreview = true;
        } else {
          this.map.set('noDueDate', 'No due dates available for this reporting start date and reporting end date.');
        }
      }));
    }



  }

  setRequestObject() {
    this.awardReport.baseDate = parseDateWithoutTimestamp(this.awardReport.baseDate);
    if (this.awardReport.frequencyBaseCode === '6') {
      this.reportTermsLookup.mapOfDates[6] = new Date(this.awardReport.baseDate).getTime();
    }
    this.awardReport.dueDate = parseDateWithoutTimestamp(this.awardReport.dueDate);
    this.awardReport.customEndDate =
    this.selectedOption === 'onCustomDate' ? parseDateWithoutTimestamp(this.awardReport.customEndDate) : null;
    this.awardReport.occurrence = this.selectedOption === 'occurrence' ? this.awardReport.occurrence : 0;
    this.awardReport.updateTimestamp = new Date().getTime();
    this.removeReportName(this.awardReport);
    return {
      awardReport: this.addAwardDetails(this.awardReport),
      frequenciesChanged: this.frequenciesChanged,
      mapOfDates: this.reportTermsLookup.mapOfDates
    };
  }
  /**
   * @param  {} reportsData
   * common function for setting award details.
   */
  addAwardDetails(reportsData) {
    reportsData.awardId = this.awardData.awardId;
    reportsData.awardNumber = this.awardData.awardNumber;
    reportsData.sequenceNumber = this.awardData.sequenceNumber;
    reportsData.updateUser = this._commonService.getCurrentUserDetail('userName');
    return reportsData;
  }

  /** removes report name which is not needed to pass in Variation request headers
   * @param  {} reportData
   */
  removeReportName(reportData) {
    delete reportData.reportName;
  }

  setEndDate() {
    if (!this.awardReport.customEndDate) {
      this.awardReport.customEndDate = getDateObjectFromTimeStamp(this._commonData.finalExpirationDate);
    }
  }

  /** commented code below is to be used  for recipients section in reporting requirement
   */

  // deleteRecipient(recipient, index) {
  //   this.warningMsg.recipientWarningText = null;
  //   this.awardReport.awardReportTermRecipient.forEach(element => {
  //     if (element.recipientId === recipient.recipientId) {
  //       this.deleteRecipientBasedOnAcType(recipient, index);
  //     }
  //   });
  // }

  // deleteRecipientBasedOnAcType(recipient: any, index) {
  //   if (recipient.acType === 'I') {
  //     this.awardReport.awardReportTermRecipient.splice(index, 1);
  //   } else {
  //     this.awardReport.awardReportTermRecipient[index].acType = 'D';
  //   }
  // }

  // /**
  //  * @param  {} event
  //  * To retrieve id and full name from elastic search result and assign to project team object
  //  */
  // selectedRecipients(event) {
  //   if (event !== null) {
  //     this.checkForDuplicateRecipients(event);
  //     this.clearRecipientField = new String('true');
  //   }
  // }

  // checkForDuplicateRecipients(event) {
  //   const dupRecipientObject = this.findDuplicateRecipients(event);
  //   if (dupRecipientObject != null) {
  //     dupRecipientObject.acType === 'D' ? dupRecipientObject.acType = 'U' :
  //       this.warningMsg.recipientWarningText = '* Recipients already added';
  //   } else {
  //     this.setRecipientObjectToAddAwardDetails(event);
  //   }
  // }

  // findDuplicateRecipients(event: any) {
  //   return this.awardReport.awardReportTermRecipient.find(recipient => recipient.recipientId === event.prncpl_id);
  // }

  // setRecipientObjectToAddAwardDetails(event: any) {
  //   let recipientObject: any = {};
  //   recipientObject.recipientId = event.prncpl_id;
  //   recipientObject.acType = 'I';
  //   recipientObject.fullName = event.full_name;
  //   recipientObject = this.addAwardDetails(recipientObject);
  //   this.awardReport.awardReportTermRecipient.push(recipientObject);
  //   this.warningMsg.recipientWarningText = null;
  // }



  /**
   * to set the details when the modal is opened
   */
  // reportModalConfiguration() {

  //   this.awardReport.reportClassCode = null;
  //   this.awardReport.reportCode = '';
  //   this.awardReport.frequencyCode = '';
  //   this.awardReport.frequencyBaseCode = '';
  //   this.awardReport.ospDistributionCode = '';
  //   this.map.clear();
  //   this.awardReport.baseDate = null;
  //   this.warningMsg.recipientWarningText = null;
  //   this.duedateError = false;
  // }

  /** restrict input fields to numbers, - and show validation.
* @param event
*/
  inputRestriction(event: any) {
    const pattern = /[0-9\+\-\/\.\ ]/;
    if (!pattern.test(String.fromCharCode(event.charCode))) {
      event.preventDefault();
    }
  }

  clearReports() {
    // this.awardReport.awardReportTermRecipient = [];
    this.clearRecipientField = new String('true');
    this.previewDates = [];
  }

  getHelpText() {
    this.$subscriptions.push(this._reportTermsService
      .fetchHelpText({ 'moduleCode': 1, 'sectionCodes': [109] }).subscribe((res: any) => {
        if (res) {
          this.helpText = res;
          this.setHelpTextForSubItems();
        }
      }));
  }

  setHelpTextForSubItems() {
    if (Object.keys(this.helpText).length && this.helpText.report && this.helpText.report.parentHelpTexts.length) {
      this.helpText = setHelpTextForSubItems(this.helpText, 'report');
      if (this.helpText.report['reportClassCode'] && this.helpText.report['reportClassCode'].parentHelpTexts.length > 0) {
        this.helpText.report = setHelpTextForSubItems(this.helpText.report, 'reportClassCode');
      }
      if (this.helpText.report['reportCode'] && this.helpText.report['reportCode'].parentHelpTexts.length > 0) {
        this.helpText.report = setHelpTextForSubItems(this.helpText.report, 'reportCode');
      }
    }
  }

}
