import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UnitHierarchyService } from '../unit-hierarchy.service';
import { RatePipeService } from './rate-pipe.service';
import { Subscription } from 'rxjs';
import { DEFAULT_DATE_FORMAT } from '../../../app-constants';
import { setFocusToElement } from '../../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { CommonService } from '../../../common/services/common.service';
import { getDateObjectFromTimeStamp, parseDateWithoutTimestamp } from '../../../common/utilities/date-utilities';

@Component({
  selector: 'app-rate-maintainance',
  templateUrl: './rate-maintainance.component.html',
  styleUrls: ['./rate-maintainance.component.css']
})
export class RateMaintainanceComponent implements OnInit, OnDestroy {
  unitId: any;
  unitName: any;
  deleteIndex: any;
  classCode: any;
  projectCount: number;
  activityType: any;
  rateTypeList: any;
  rateList: any;
  tempRateDetails: any;
  rateType: any;
  direction: any;
  rateDetails:     any = [];
  rateClass:       any = [];
  copyRateDetails: any = [];
  sortBy         = '';
  searchType     = '';
  searchClass    = '';
  campusFlag     = 'ON';
  isViewMode     = false;
  isValid        = false;
  isDesc         = true;
  isYear         = false;
  isLaFlag       = false;
  isMultiple     = false;
  isEdit         = false;
  isValueChanged = false;
  selectedIndex  = null;
  rateMaintainance: any = {
    activityTypeCode: '',
    fiscalYear: '',
    rateClassCode: '',
    rateTypeCode: '',
    startDate: '',
    instituteRate: '',
    onOffCampusFlag: 'N'
  };
  paginatedRateData = {
    limit: 20,
    page_number: 1,
  };
  datePlaceHolder = DEFAULT_DATE_FORMAT;
  setFocusToElement = setFocusToElement;
  $subscriptions: Subscription[] = [];
  isSaving = false;

  constructor(private _router: ActivatedRoute, private router: Router, private _rateService: UnitHierarchyService,
        private _ratePipe: RatePipeService, public _commonService: CommonService) { }

  ngOnInit() {
    this.$subscriptions.push(this._router.queryParams.subscribe(params => {
      this.unitId = params['unitId'];
    }));
    if (this.unitId !== undefined) {
      this.chooseMaintainance();
    }
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
  /**
  * Rate maintainance or LA rate maintainance choosing w.r.t user selection for displaying it's respective rates
  */
  chooseMaintainance() {
    if (this._router.snapshot.url[0].path === 'LArateMaintainance') {
      this.laRateMaintainanceData();
      this.isLaFlag = true;
    } else {
      this.rateMaintainanceData();
    }
  }
  rateMaintainanceData() {
    return new Promise((resolve, reject) => {
      this.$subscriptions.push(this._rateService.getRateMaintainanceData(this.unitId).subscribe((data: any) => {
        this.rateClass   = data.rateClassList;
        this.unitName    = data.unitName;
        this.rateDetails = data.instituteRatesList;
        this.projectCount    = this.rateDetails.length;
        this.tempRateDetails = this.rateDetails.slice(0, this.paginatedRateData.limit);
        this.rateType        = data.rateTypeList;
        this.activityType    = data.activityTypeList;
        this.copyRateDetails = this.rateDetails;
        resolve(true);
      }));
    });
  }
  laRateMaintainanceData() {
    return new Promise((resolve, reject) => {
      this.$subscriptions.push(this._rateService.getlaRateMaintainanceData(this.unitId).subscribe((data: any) => {
        this.rateClass   = data.rateClassLaList;
        this.unitName    = data.unitName;
        this.rateDetails = data.instituteLARatesList;
        this.projectCount    = this.rateDetails.length;
        this.tempRateDetails = this.rateDetails.slice(0, this.paginatedRateData.limit);
        this.rateType        = data.rateTypeLaList;
        this.copyRateDetails = this.rateDetails;
        resolve(true);
      }));
    });
  }
  /**
  * Filtering rate type w.r.t rate class
  */
  getRateType(rate) {
    this.searchType = '';
    this.classCode  = rate;
    if (rate !== '') {
      this.rateTypeList = this.rateType.filter((list: any) => list.rateClassCode === rate);
      this.rateList     = this.rateTypeList;
    } else {
      this.rateTypeList = [];
      this.chooseMaintainance();
    }
  }
  /**
  * Filtering add or edit rate type w.r.t rate class
  */
  getModalRateType(rate) {
    this.classCode      = rate;
    this.isValueChanged = true;
    this.rateMaintainance.rateTypeCode = '';
    if (rate !== '') {
      this.rateList = this.rateType.filter((list: any) => list.rateClassCode === rate);
    } else {
      this.rateList = [];
      this.chooseMaintainance();
    }
  }
  /**
  *Filtering rates w.r.t rate class and rate code
  */
  getRateDetails(type) {
    if (type !== '') {
      this.rateDetails     = this.copyRateDetails;
      this.rateDetails     = (this.rateDetails.filter((list: any) => list.rateClassCode === this.classCode))
                                              .filter((list: any) => list.rateTypeCode === type);
      this.projectCount    = this.rateDetails.length;
      this.tempRateDetails = this.rateDetails.slice(0, this.paginatedRateData.limit);
    } else {
      this.tempRateDetails = (this.rateDetails.filter((list: any) => list.rateClassCode === this.classCode));
      this.projectCount    = this.rateDetails.length;
    }
  }
  /**
  * Rate table header sorting funtionality
  */
  rateTableSort(headerName) {
    this.isDesc      = (this.sortBy === headerName) ? !this.isDesc : false;
    this.direction   = this.isDesc ? 1 : -1;
    this.sortBy      = headerName;
    this.rateDetails = this._ratePipe.sortAnArray(this.rateDetails, headerName, this.direction);
    setTimeout(() => {
      this.tempRateDetails = this.rateDetails.slice(0, this.paginatedRateData.limit);
      this.paginatedRateData.page_number = 1;
    }, 0);
  }
  /**
  * Bind rate maintainance object with selected rate value
  */
  setRateValue(rate) {
    this.rateMaintainance.rateClassCode    = rate.rateClassCode;
    this.rateMaintainance.rateTypeCode     = rate.rateTypeCode;
    this.rateMaintainance.activityTypeCode = rate.activityTypeCode;
    this.campusFlag                        = rate.campusFlag;
    this.rateMaintainance.id               = rate.id;
    this.rateMaintainance.instituteRate    = rate.instituteRate;
    this.rateMaintainance.fiscalYear       = rate.fiscalYear;
    this.rateMaintainance.onOffCampusFlag  = rate.onOffCampusFlag;
    this.rateMaintainance.startDate        = getDateObjectFromTimeStamp(rate.startDate);
    this.rateMaintainance.versionNumber    = rate.versionNumber;
    this.rateMaintainance.active           = rate.active;
  }
  /**
   * @param  {} rate
   * filter the rate list and set flags to default value
   */
  editRate(rate, rateIndex) {
    this.selectedIndex = rateIndex;
    this.isMultiple = this.isValueChanged = this.isYear = this.isValid = false;
    this.isEdit = true;
    this.setRateValue(rate);
    this.rateList = this.rateType.filter((list: any) => list.rateClassCode === this.rateMaintainance.rateClassCode);
  }
  /**
   *Setting dummy objectId and other required data to the object
   */
  setNewRate() {
    this.rateMaintainance.rateClassCode    = this.searchClass;
    this.rateMaintainance.rateTypeCode     = this.searchType;
    this.rateMaintainance.activityTypeCode = '';
    this.campusFlag                        = 'ON';
    this.rateMaintainance.startDate        = null;
    this.rateMaintainance.id               = null;
    this.rateMaintainance.fiscalYear       = null;
    this.rateMaintainance.instituteRate    = null;
    this.isMultiple = this.isValueChanged  = this.isValid = this.isYear = this.isEdit = false;
  }
  setDeleteIndex(rate, index) {
    this.setRateValue(rate);
    this.deleteIndex = index;
  }
  /**
   * Delete a specific rate
   */
  deleteRate() {
    if (!this.isLaFlag) {
      this.$subscriptions.push(this._rateService.deleteRateData(this.rateMaintainance).subscribe(data => {
        this.tempRateDetails.splice(this.deleteIndex, 1);
      }));
    } else {
      this.rateMaintainance.unitNumber = this.unitId;
      this.$subscriptions.push(this._rateService.deleteLaRateData(this.rateMaintainance).subscribe(data => {
        this.tempRateDetails.splice(this.deleteIndex, 1);
      }));
    }
  }

  /**
  * restrict input fields to numbers, - and /
  * @param event
  */
  inputRestriction(event: any) {
    const pattern = /[0-9\+\-\/\ ]/;
    if (!pattern.test(String.fromCharCode(event.charCode))) {
      event.preventDefault();
    }
  }

  limitKeypress(event) {
    this.isValueChanged = true;
    const pattern = /^(?:[0-9][0-9]{0,2}(?:\.\d{0,2})?|999|999.00|999.99)$/;
    if (!pattern.test(event)) {
      this.rateMaintainance.instituteRate = '';
    }
  }
  /**
   * @param  {} year
   * Year validation by checking whether the length is 4 or not
   */
  checkValidYear(year) {
    year >= 1900 && year < 2100 ? this.isYear = false : this.isYear = true;
  }
  /**
   * Remaining rate maintainance object value setting
   */
  setRateObject() {
    this.rateMaintainance.unitNumber = this.unitId;
    this.rateMaintainance.updateUser = this._commonService.getCurrentUserDetail('userName');
    this.campusFlag === 'ON' ? this.rateMaintainance.onOffCampusFlag = 'N' : this.rateMaintainance.onOffCampusFlag = 'F';
    this.rateMaintainance.startDate = parseDateWithoutTimestamp(this.rateMaintainance.startDate);
    if (this.isLaFlag) {
      this.rateMaintainance.rateTypeCode = '1';
      delete this.rateMaintainance.activityTypeCode;
    }
  }
  /**
   * @param  {} value
   * Rate validation by checking null value
   */
  rateValidation(value) {
    if (value.rateClassCode === '' || value.rateTypeCode === '' || value.activityTypeCode === ''
      || value.fiscalYear === null || value.startDate === null || value.instituteRate === null) {
      this.isValid = true;
    } else {
      this.isValid = false;
    }
  }
  /**
  * @param  {} rate
  * Rate validation by checking multiple entries in datebase with same
  * unitNumber,rateClasscode,rateTypecode,activityTypeCode,fiscalYear,startDate and onOffCampusFlag
  */
  multipleEntryValidation(rate, selectedIndex) {
    this.isMultiple  = false;
    const rateString = rate.rateClassCode.concat(
      rate.rateTypeCode,
      rate.activityTypeCode,
      rate.fiscalYear,
      rate.startDate,
      rate.unitNumber,
      rate.onOffCampusFlag);
    this.rateDetails.forEach((element, index) => {
      if (index !== selectedIndex) {
        const rateArray = element.rateClassCode.concat(
          element.rateTypeCode,
          element.activityTypeCode,
          element.fiscalYear,
          parseDateWithoutTimestamp(element.startDate),
          element.unitNumber,
          element.onOffCampusFlag);
        if (rateArray === rateString) {
          this.isMultiple = true;
        }
      }
    });
  }
  /**
   *  @param  {} page
   * Slicing data for pagination
   */
  pagination(page) {
    this.tempRateDetails = this.rateDetails.slice(page * this.paginatedRateData.limit - this.paginatedRateData.limit,
                           page * this.paginatedRateData.limit);
  }
  /**
   * add or update rates after completing proper validation and display the result by appling filter
   */
  saveRate() {
    this.setRateObject();
    this.rateValidation(this.rateMaintainance);
    if (this.isValueChanged && !this.isSaving) {
      this.isSaving = true;
      this.multipleEntryValidation(this.rateMaintainance, this.selectedIndex);
      if (!this.isYear && !this.isMultiple && !this.isValid) {
        if (this.isLaFlag) {
              this.addLARateMaintainance();
          } else {
          this.addRateMaintainance();
        }
      }
    } else {
      if (this.isEdit) {
        document.getElementById('closeModal').click();
      }
    }
  }
  /**
   * Rate and LARate maintainance service calls
   */
  addRateMaintainance() {
    this.$subscriptions.push(this._rateService.saveInstituteRates(this.rateMaintainance, this.campusFlag).subscribe((data: any) => {
      if (data) { // tslint:disable
        this.rateMaintainanceData().then(data => {
          this.searchClass = this.rateMaintainance.rateClassCode;
          this.getRateType(this.searchClass);
          this.searchType = this.rateMaintainance.rateTypeCode;
          this.getRateDetails(this.searchType);
        });
      }
      document.getElementById('closeModal').click();
      this.isSaving = false;
    }));
  }
  addLARateMaintainance() {
    this.$subscriptions.push(this._rateService.saveLARates(this.rateMaintainance, this.campusFlag)
      .subscribe((data: any) => {
        if (data) {
          this.laRateMaintainanceData().then(data => {
            this.searchClass = this.rateMaintainance.rateClassCode;
            this.getRateType(this.searchClass);
            this.searchType = this.rateMaintainance.rateTypeCode;
            this.getRateDetails(this.searchType);
          });
        }
        this.isSaving = false;
        document.getElementById('closeModal').click();
      }, err => { this.isSaving = false; }));
  }
}
