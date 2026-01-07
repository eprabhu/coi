import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { CommonService } from '../../../common/services/common.service';
import { ElasticConfigService } from '../../../common/services/elastic-config.service';
import { getEndPointOptionsForLeadUnit, getEndPointOptionsForSponsor } from '../../../common/services/end-point.config';
import { fileDownloader, openInNewTab, pageScroll, validatePercentage } from '../../../common/utilities/custom-utilities';
import { PersonMaintenanceService } from '../person-maintenance.service';

@Component({
  selector: 'app-timesheet',
  templateUrl: './timesheet.component.html',
  styleUrls: ['./timesheet.component.css']
})
export class TimesheetComponent implements OnInit {

  $subscriptions: Subscription[] = [];
  awardTimesheetLoadObject: any = {
    property1: null,
    property2: null,
    property3: null,
    property4: null,
    property5: null,
    property6: [],
    currentPage: 1,
    itemsPerPage: 20,
    personId: null,
    sortType: "L",
    reverse: '',
    sortBy: '',
  }
  setAwardResponseObject: any = {};
  timesheetData: any = {};
  timeSheetList: any = {};
  currentYear = new Date().getFullYear();
  currentQuarter = null;
  timeCommitmentErrorCount = 0;
  isTimeDataChanged = false;
  isSaving = false;
  awardTimesheetDetails: any = {};
  isDesc: any;
  elasticSearchOptions: any = {};
  clearAwardField: String;
  leadUnitSearchOptions: any = {};
  fundingAgencySearchOptions: any = {};
  clearFieldLeadUnit: String;
  clearGrantField: String;
  clearFieldFundingAgency: String;
  rolePersonName: any;
  roleName: any;
  awardTypeOptions = 'AWARD_TYPE#AWARD_TYPE_CODE#true#true';
  lookupValues: any = {};
  loginPersonId: any;
  isMaintainTimeSheet = false;

  constructor(public _personService: PersonMaintenanceService, private _activeRoute: ActivatedRoute,
    private _elasticConfig: ElasticConfigService, public _commonService: CommonService) { }

  ngOnInit() {
    this._personService.isPersonEditOrView = true;
    this.loginPersonId = this._commonService.getCurrentUserDetail('personID');
    this.fundingAgencySearchOptions = getEndPointOptionsForSponsor();
    this.leadUnitSearchOptions = getEndPointOptionsForLeadUnit();
    this.elasticSearchOptions = this._elasticConfig.getElasticForAward();
    this.awardTimesheetLoadObject.personId = this._activeRoute.snapshot.queryParamMap.get('personId');
    this.getActiveAwardsByPersonId();
  }

  getActiveAwardsByPersonId() {
    this.$subscriptions.push(this._personService.getActiveAwardsByPersonId(this.awardTimesheetLoadObject).subscribe((data: any) => {
      this.setAwardResponseObject = data;
      this._personService.personDisplayCard = data.person;
    }));
  }

  actionsOnPageChange(event) {
    this.awardTimesheetLoadObject.currentPage = event;
    this.getActiveAwardsByPersonId();
    pageScroll('pageScrollToTop');
  }

  routeToAwardId(awardId) {
    openInNewTab('award/overview?', ['awardId'], [awardId]);
  }

  getCurrentQuarter(type) {
    let quarter = null;
    const MONTH = new Date().getMonth();
    switch (type) {
      case 'QUARTERLY': quarter = (MONTH < 4) ? 1 : (MONTH < 7) ? 2 : (MONTH < 10) ? 3 : 4; break;
      case 'HALFYEARLY': quarter = (MONTH < 7) ? 1 : 2; break;
      case 'YEARLY': quarter = 1; break;
      default: break;
    }
    return quarter;
  }

  setTimesheetpersonDetails(award) {
    this.awardTimesheetDetails = award;
    this.awardTimesheetDetails.awardPersons.forEach(element => {
      if (element.personId == this.awardTimesheetLoadObject.personId) {
        this.rolePersonName = element.fullName;
        this.roleName = (element.proposalPersonRole.description == 'Lead Principal Investigator') ?
        'Principal Investigator' : element.proposalPersonRole.description;
      }
    });
  }

  onLookupSelect(data, template) {
    this.lookupValues[template] = data;
    this.awardTimesheetLoadObject[template] = data.length ? data.map(d => d.code) : [];
  }

  getAwardKeyPersonTimesheetDetails(award) {
    this.setTimesheetpersonDetails(award);
    const personTimesheetData = {
      'awardId': award.awardId,
      'awardPersonId': this.awardTimesheetDetails.awardPersonId,
    };
    this.$subscriptions.push(this._personService.getAwardKeyPersonTimesheetDetails(personTimesheetData).subscribe((data: any) => {
      this.timesheetData = data;
      this.isTimeDataChanged = false;
      this.timeCommitmentErrorCount = 0;
      this.currentQuarter = this.getCurrentQuarter(this.timesheetData.awardKeyPersonTimesheetType);
      this.isMaintainTimeSheet = this.timesheetData.maintainTimesheetRightExist ||
        this.awardTimesheetLoadObject.personId === this.loginPersonId;
      this.getTimeSheetList();
    }));
  }

  getTimeSheetList() {
    this.timeSheetList = {};
    const TIME_DATA = {
      year: null,
      awardNumber: this.awardTimesheetDetails.awardNumber,
      awardId: this.awardTimesheetDetails.awardId,
      awardPersonId: this.awardTimesheetDetails.awardPersonId,
      value: null,
      timesheetType: this.timesheetData.awardKeyPersonTimesheetType,
      orderNumber: null
    };
    const beginYear = new Date(this.awardTimesheetDetails.beginDate).getFullYear();
    const endYear = new Date(this.awardTimesheetDetails.finalExpirationDate).getFullYear();
    const QUARTER_COUNT = this.timesheetData.awardKeyPersonTimesheetType === 'YEARLY' ?
      1 : this.timesheetData.awardKeyPersonTimesheetType === 'HALFYEARLY' ? 2 : 4;
    for (let year = beginYear; year <= endYear; year++) {
      this.timeSheetList[year] = this.timesheetData.awardKeyPersonTimesheetDetails[year] || [];
      for (let quarter = 0; quarter < QUARTER_COUNT; quarter++) {
        if (!this.timeSheetList[year][quarter]) {
          TIME_DATA.orderNumber = this.getUnSavedOrderNumber(year, QUARTER_COUNT);
          TIME_DATA.year = year;
          this.timeSheetList[year][quarter] = Object.assign({}, TIME_DATA);
        }
      }
      this.timeSheetList[year].sort((current, next) => current.orderNumber > next.orderNumber ? 1 : -1);
    }
  }

  /**
    * @param year 
    * @param QUARTER_COUNT 
    * This function finds and returns the order number of a particular year that are not saved in database.
    */
  getUnSavedOrderNumber(year, QUARTER_COUNT) {
    for (let orderNumber = 1; orderNumber <= QUARTER_COUNT; orderNumber++) {
      if (!this.timeSheetList[year].find(timeInfo => timeInfo.orderNumber === orderNumber)) {
        return orderNumber;
      }
    }
  }

  validateTimeCommitmentPercentage(value, year, position) {
    const validationMessage = validatePercentage(value);
    validationMessage ? this.setTimeCommitmentError(year, position, validationMessage) :
      this.removeTimeCommitmentError(year, position);
  }

  /**
  * @param year 
  * @param position
  * Removes the error properties set on time sheet modal if already an error is set.
  * Updates the error count during pass from a failed validation.
  */
  removeTimeCommitmentError(year, position) {
    if (document.getElementById('time-sheet-error-' + year + '-' + position).innerHTML) {
      this.timeCommitmentErrorCount--;
      document.getElementById('time-sheet-' + year + '-' + position).classList.remove('is-invalid', 'd-block');
      document.getElementById('time-sheet-error-' + year + '-' + position).innerHTML = null;
    }
  }


  /**
   * @param year 
   * @param position 
   * @param validationMessage
   * Adds the error properties (border and message) to particular value field that causes validation error if error property is not set.
   * Keeps track with error count to see how many fields are faced with validation failures.
   */
  setTimeCommitmentError(year, position, validationMessage) {
    if (!document.getElementById('time-sheet-error-' + year + '-' + position).innerHTML) {
      this.timeCommitmentErrorCount++;
      document.getElementById('time-sheet-' + year + '-' + position).classList.add('is-invalid', 'd-block');
      document.getElementById('time-sheet-error-' + year + '-' + position).innerHTML = validationMessage;
    }
  }

  saveOrUpdateAwardKeyPersonTimesheet() {
    if (this.isTimeDataChanged && !this.timeCommitmentErrorCount && !this.isSaving) {
    this.isSaving = true;
      this.$subscriptions.push(this._personService.saveOrUpdateAwardKeyPersonTimesheet({ 'awardKeyPersonTimesheet': this.getTimeSheetRequestdData() })
        .subscribe((data: any) => {
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Timesheet data saved successfully.');
          document.getElementById('timesheet-cancel-btn').click();
          this.isTimeDataChanged = false;
    this.isSaving = false;
        }));
    }
  }

  /**
   * Gives data that only have values or have keypersonTimesheetId of current and all previous years.
   * keypersonTimesheetId with null values are deleted from database.
   */
  getTimeSheetRequestdData() {
    let timesheetData = [];
    const beginYear = new Date(this.awardTimesheetDetails.beginDate).getFullYear();
    const endYear = new Date(this.awardTimesheetDetails.finalExpirationDate).getFullYear();
    for (let year = beginYear; year <= endYear; year++) {
      timesheetData.push(...this.timeSheetList[year].filter(timeData => timeData.value || timeData.value === 0 || timeData.keypersonTimesheetId));
    }
    return timesheetData;
  }

  exportAsTypeDoc(docType: any) {
    const exportHeading = 'Timesheet';
    const exportType = docType === 'excel' ? 'xlsx' : docType === 'pdf' ? 'pdf' : '';
    this.$subscriptions.push(this._personService.generateAwardKeyPersonTimesheetReport({
      'documentHeading': exportHeading, exportType: exportType,
      'awardId': this.awardTimesheetDetails.awardId, 'awardPersonId': this.awardTimesheetDetails.awardPersonId,
      'personId': this.awardTimesheetLoadObject.personId,
    }).subscribe(
      data => {
        fileDownloader(data.body, exportHeading.toLowerCase(), exportType);
      }));
  }

  sortBy(sortFieldBy) {
    this.awardTimesheetLoadObject.reverse = this.isDesc === false ? 'DESC' : 'ASC';
    this.awardTimesheetLoadObject.sortBy = sortFieldBy;
    this.getActiveAwardsByPersonId();
  }

  inputRestriction(event: any) {
    const pattern = /[0-9\+\-\/\ ]/;
    if (!pattern.test(String.fromCharCode(event.charCode))) {
      event.preventDefault();
    }
  }

  searchUsingAdvanceOptions(pageNumber) {
    this.propertyFieldNullCheck();
    this.awardTimesheetLoadObject.currentPage = pageNumber;
    this.awardTimesheetLoadObject.sortType = "A";
    this.$subscriptions.push(this._personService.getActiveAwardsByPersonId(this.awardTimesheetLoadObject)
      .subscribe(data => {
        this.setAwardResponseObject = data
      }));
  }

  propertyFieldNullCheck() {
    this.awardTimesheetLoadObject.property1 = this.awardTimesheetLoadObject.property1 == "" ? null : this.awardTimesheetLoadObject.property1;
    this.awardTimesheetLoadObject.property2 = this.awardTimesheetLoadObject.property2 == "" ? null : this.awardTimesheetLoadObject.property2;
    this.awardTimesheetLoadObject.property3 = this.awardTimesheetLoadObject.property3 == "" ? null : this.awardTimesheetLoadObject.property3;
    this.awardTimesheetLoadObject.property4 = this.awardTimesheetLoadObject.property4 == "" ? null : this.awardTimesheetLoadObject.property4;
    this.awardTimesheetLoadObject.property5 = this.awardTimesheetLoadObject.property4 == "" ? null : this.awardTimesheetLoadObject.property5;

  }

  leadUnitChangeFunction(result) {
    if (result) {
      this.awardTimesheetLoadObject.property4 = result.unitNumber;
    } else {
      this.awardTimesheetLoadObject.property4 = '';
    }
  }

  /**
  * @param
  * When using keyvalue pipe sortNull act as comparision Function to avoid sorting based on key
  */
  sortNull() { return 0; }

  clear() {
    this.lookupValues= [];
    this.awardTimesheetLoadObject.property1 = '';
    this.awardTimesheetLoadObject.property2 = '';
    this.awardTimesheetLoadObject.property3 = '';
    this.awardTimesheetLoadObject.property4 = '';
    this.clearFieldLeadUnit = new String('true');
    this.clearFieldFundingAgency = new String('true');
    this.awardTimesheetLoadObject.property5 = '';
    this.awardTimesheetLoadObject.property6 = [];
    this.awardTimesheetLoadObject.reverse = '';
    this.awardTimesheetLoadObject.sortBy = '';
  }
}
