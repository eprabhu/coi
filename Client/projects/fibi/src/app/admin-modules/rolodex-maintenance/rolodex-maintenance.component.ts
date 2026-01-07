import { Component, OnInit, OnDestroy } from '@angular/core';
import { RolodexMaintenanceService } from './rolodex-maintenance.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { fadeDown } from '../../common/utilities/animations';
import { CommonService } from '../../common/services/common.service';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS, ROLODEX_FULL_NAME } from '../../app-constants';
import { getEndPointOptionsForSponsor } from '../../common/services/end-point.config';
import { ElasticConfigService } from '../../common/services/elastic-config.service';
import { AuditLogService } from '../../common/services/audit-log.service';
import { deepCloneObject } from '../../common/utilities/custom-utilities';
import { RolodexAuditLog } from './interface';

@Component({
  selector: 'app-rolodex-maintenance',
  templateUrl: './rolodex-maintenance.component.html',
  styleUrls: ['./rolodex-maintenance.component.css'],
  providers: [AuditLogService,
		{ provide: 'moduleName', useValue: 'ROLODEX' }],
  animations: [fadeDown]
})
export class RolodexMaintenanceComponent implements OnInit, OnDestroy {
  prefixType = [];
  isSearchRolodexActive = false;
  rolodexName: any;
  organizationName: '';
  sponsorName: any;
  rolodexResults: any = [];
  organizationResults: any = [];
  countryHttpOptions: any = {};
  searchCountryHttpOptions: any = {};
  sponsorResults: any = [];
  isRolodexView = false;
  rolodex: any = {};
  rolodexSearchOptions: any = {};
  organizationHttpOptions: any = {};
  sponsorSearchOptions: any = {};
  debounceTimer: any;
  toast_message: string;
  isSearchOrganizationActive = false;
  isNewRolodex = false;
  isShowAdvanceSearchOptions = false;
  result: any = {};
  sortMap: any = {};
  rolodexList: any[] = null;
  showAdvanceSearchList = false;
  noRolodexView = false;
  rolodexId: any;
  isAdvancedSearch = false;
  clearField: String;
  clearFieldElastic: String;
  clearCountryField: String;
  $subscriptions: Subscription[] = [];
  elasticSearchOptions: any = {};
  rolodexRequestObject = {
    property1: '', property2: '', property3: '', property4: '', property5: '', property6: '', property7: '', property8: '',
    property9: '', property10: '', property11: '', property12: '', pageNumber: 20, sortBy: 'updateTimeStamp', sort: {}, reverse: 'DESC',
    currentPage: 1,
  };
  genderType = '';
  sortCountObj = {
    'firstName': 0, 'lastName': 0, 'middleName': 0, 'sponsorName': 0, 'sponsor.countryCode': 0,
    'organization': 0, 'city': 0, 'state': 0, 'createUserFullName': 0, 'active': 0
  };
  isMaintainRolodex = false;
  isNameChanged = false;
  rolodexMap = new Map();
  organizationCountry: any;
  sponsorCountry: any;
  sponsorCountryHttpOptions: any = {};
  clearSponsorCountryField: String;
  newOrganizationName = {
    organizationId: null,
    organizationName: '',
    isActive: true
  };
  isSaving = false;
  helpInfo = false;
  clearCreateUser: any;
  lastName = '';
  before: RolodexAuditLog;

  constructor(private _rolodexService: RolodexMaintenanceService, public _commonService: CommonService,
    private _router: ActivatedRoute, private _elasticConfig: ElasticConfigService, private _auditLogService: AuditLogService) { }

  ngOnInit() {
    this.rolodexRequestObject.currentPage = 1;
    this.rolodexSearchOptions = this._elasticConfig.getElasticForRolodex();
    this.organizationHttpOptions = this._rolodexService.setSearchOptions('organizationName', 'organizationName', 'findOrganizations');
    this.sponsorSearchOptions = getEndPointOptionsForSponsor();
    this.countryHttpOptions = this._rolodexService.setSearchOptions('countryName', 'countryName', 'findCountry');
    this.searchCountryHttpOptions = this._rolodexService.setSearchOptions('countryName', 'countryName', 'findCountry');
    this.sponsorCountryHttpOptions = Object.assign({}, this.countryHttpOptions);
    this.elasticSearchOptions = this._elasticConfig.getElasticForPerson();
    this.$subscriptions.push(this._router.queryParams.subscribe(params => {
      this.rolodexId = params['rolodexId'];
    }));
    this.getRolodexDetails();
    this.getPermissions();
  }
  getRolodexDetails() {
    if (this.rolodexId) {
      this.$subscriptions.push(this._rolodexService.getRolodexData(this.rolodexId).subscribe((data: any) => {
        this.rolodex = data.rolodex;
        this.organizationCountry = this.rolodex.organizations && this.rolodex.organizations.country ?
          this.rolodex.organizations.country.countryName : '';
        this.sponsorCountry = this.rolodex.sponsor && this.rolodex.sponsor.country ? this.rolodex.sponsor.country.countryName : '';
        this.isRolodexView = true;
        this.isNewRolodex = false;
        this.showAdvanceSearchList = false;
      }));
    } else {
      this.focusToRolodexSearch();
    }
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  /**
   * This function creates a full name if user enters First, Middle or Lastname only if user hasn't entered manually in full name field.
   * replace() is used here to remove multiple space that generated if user gives first and last name but not middle.
   * trim() removes space from front and back of Full name generated.
   */
  processFullName() {
    this.rolodex.firstName = this.rolodex.firstName ? this.rolodex.firstName.trim() : '';
    this.rolodex.middleName = this.rolodex.middleName ? this.rolodex.middleName.trim() : '';
    this.rolodex.lastName = this.rolodex.lastName ? this.rolodex.lastName.trim() : '';
    this.rolodex.fullName = ROLODEX_FULL_NAME.replace("LASTNAME", this.rolodex.lastName)
      .replace("FIRSTNAME", this.rolodex.firstName).replace("MIDDLENAME", this.rolodex.middleName);
    if (!this.rolodex.lastName || (!this.rolodex.middleName && !this.rolodex.firstName)) {
      this.rolodex.fullName = this.rolodex.fullName.replace(',', '');
    }
    this.rolodex.fullName = this.rolodex.fullName.replace(/ {1,}/g, ' ');
    this.rolodex.fullName = this.rolodex.fullName.trim();
  }

  async getPermissions() {
    this.isMaintainRolodex = await this._commonService.checkPermissionAllowed('MAINTAIN_ROLODEX');
  }

  focusToRolodexSearch() {
    if (!this.isAdvancedSearch) {
      setTimeout(() => {
        (document.getElementsByClassName('app-endpoint-search')[0] as HTMLElement).focus();
      }, 0);
    }
  }

  selectElasticResult(event): void {
    if (event) {
      const rolodex = {
        fullName: event.full_name,
        rolodexId: event.rolodex_id
      };
      this.selectRolodex(rolodex, '');
    }
  }

  navigateToList(): void {
    this.loadRolodex(1);
    this.showAdvanceSearchList = true;
    this.isRolodexView = false;
    this.rolodexName = '';
    this.isNewRolodex = false;
    this.rolodex = {};
    this.organizationName = '';
    this.sponsorName = '';
    this.clearField = new String('true');
  }

  selectRolodex(selectedRolodex, type) {
    if (selectedRolodex) {
      this.rolodexName = selectedRolodex.fullName;
      this.rolodexResults = [];
      this.$subscriptions.push(this._rolodexService.getRolodexData(selectedRolodex.rolodexId).subscribe((data: any) => {
        this.rolodex = data.rolodex;
        if (type === 'view') {
          this.isRolodexView = true;
          this.isNewRolodex = false;
        } else if (type === 'edit') {
          this.genderType = this.rolodex.prefix;
          this.organizationHttpOptions.defaultValue =
            this.rolodex.organizations != null ? this.rolodex.organizations.organizationName : this.rolodex.organizationName;
          this.sponsorSearchOptions.defaultValue = this.rolodex.sponsor != null ? this.rolodex.sponsor.sponsorName : null;
          this.countryHttpOptions.defaultValue = this.rolodex.country != null ? this.rolodex.country.countryName : null;
          this.sponsorCountry = this.rolodex.sponsor && this.rolodex.sponsor.country ?
            this.rolodex.sponsor.country.countryName : '';
          this.organizationCountry = this.rolodex.organizations && this.rolodex.organizations.country ?
            this.rolodex.organizations.country.countryName : '';
          this.isRolodexView = false;
          this.isNewRolodex = true;
        } else {
          this.isNewRolodex = false;
          this.isRolodexView = true;
          this.isAdvancedSearch = false;
        }
        this.showAdvanceSearchList = false;
        this.before = this.prepareAuditLogObject(deepCloneObject(data.rolodex));
      }));
    }
  }

  /**
   * removing unwanted keys and values.
   * adding --None-- for empty values.
   * @param rolodex 
   * @returns 
   */
  prepareAuditLogObject(rolodex: any): RolodexAuditLog {
      let auditLog = deepCloneObject(rolodex);
      delete auditLog.countryCode;
      delete auditLog.country;
      delete auditLog.acType;
      delete auditLog.createUserFullName;
      delete auditLog.organizationName;
      delete auditLog.organizations;
      delete auditLog.sponsor;
      delete auditLog.sponsorCode;
      delete auditLog.sponsorName; 
      delete auditLog.updateTimestamp;
      Object.keys(auditLog).forEach(ele => {
        auditLog[ele] = auditLog[ele] || "--NONE--";
      });
      auditLog['COUNTRY'] =  rolodex.country ? rolodex.countryCode + '-' + rolodex.country.countryName : "--NONE--";
      auditLog['ORGANIZATION'] =  rolodex.organization ? rolodex.organization + '-' + rolodex.organizations.organizationName : "--NONE--";
      auditLog['SPONSOR'] =  rolodex.sponsor ? rolodex.sponsorCode + '-' + rolodex.sponsor.sponsorName : "--NONE--";
      return auditLog;
  }

  selectOrganization(event) {
    this.rolodex.organization = event != null ? event.organizationId : null;
    this.rolodex.organizations = event != null ? event : null;
    if (event && event.country && !this.rolodex.countryCode) {
      this.organizationCountry = event.country ? event.country.countryName : '';
      this.rolodex.countryCode = event.country ? event.country.countryCode : '';
      this.rolodex.country = event.country ? event.country : '';
      this.clearCountryField = new String('false');
      this.countryHttpOptions.defaultValue = event.country.countryName;
    }
  }

  /**
 * @param  {} type
 * Insert , update and delete rolodex details
 */
  saveRolodex(type) {
    this.rolodexValidation();
    if (!this.rolodexMap.size && !this.isSaving) {
      this.isSaving = true;
      const ROLODEX_DATA: any = {};
      ROLODEX_DATA.acType = type;
      this.rolodex.prefix = this.genderType;
      ROLODEX_DATA.rolodex = this.rolodex;
      this.$subscriptions.push(this._rolodexService.saveRolodexData(ROLODEX_DATA).subscribe((data: any) => {
        this.toast_message = data.message;
        if (data.message === 'Email Address already exists.') {
          this._commonService.showToast(HTTP_ERROR_STATUS, this.toast_message);
          this.isRolodexView = false;
        } else {
          this.isRolodexView = true;
          this.isNewRolodex = false;
          this.rolodex = data.rolodex;
          this._commonService.showToast(HTTP_SUCCESS_STATUS, this.toast_message);
          this.rolodexMap.clear();
        } 
        let after = this.prepareAuditLogObject(data.rolodex);
        if (type == 'I') {
          this._auditLogService.saveAuditLog('I', null, after, null, Object.keys(after), data.rolodex.rolodexId);
        } else if(type == 'U') {
          this._auditLogService.saveAuditLog('U', this.before, after, null, Object.keys(after), data.rolodex.rolodexId);
        }
        this.getRolodexDetails();
        this.isSaving = false;
      }, err => { this.isSaving = false; }));
    }
  }

  /** show and hide advance search feature
  * @param event
  */
  showAdvanceSearch(event: any) {
    event.preventDefault();
    this.isShowAdvanceSearchOptions = !this.isShowAdvanceSearchOptions;
    this.clear();
  }
  /** clear all advanced search fields */
  clear() {
    this.rolodexRequestObject.property1 = '';
    this.rolodexRequestObject.property2 = '';
    this.rolodexRequestObject.property3 = '';
    this.rolodexRequestObject.property4 = '';
    this.rolodexRequestObject.property5 = '';
    this.rolodexRequestObject.property6 = '';
    this.rolodexRequestObject.property7 = '';
    this.rolodexRequestObject.property8 = '';
    this.rolodexRequestObject.property9 = null;
    this.rolodexRequestObject.property10 = '';
    this.rolodexRequestObject.property11 = null;
    this.rolodexRequestObject.property12 = null;
    this.clearCreateUser = new String('true');
    this.rolodexList = [];
    this.clearCountryField = new String('true');
    this.clearSponsorCountryField = new String('true');
    this.clearField = new String('true');
    // this.clearFieldElastic = new String('true');
  }
  /** fetch rolodex list */
  loadRolodex(pageNumber) {
    this.rolodexRequestObject.currentPage = pageNumber;
    this.$subscriptions.push(this._rolodexService.fetchRolodexData(this.rolodexRequestObject)
      .subscribe(data => {
        this.result = data || [];
        if (this.result.rolodexes.length > 1) {
          this.rolodexList = this.result.rolodexes;
          this.showAdvanceSearchList = true;
          this.isRolodexView = false;
          this.isNewRolodex = false;
          // }
          // else if (this.result.rolodexes.length === 1 && !this.showAdvanceSearchList) {
          //   this.rolodexList = null;
          //   this.rolodex = this.result.rolodexes[0];
          //   this.showAdvanceSearchList = false;
          //   this.isRolodexView = true;
        } else {
          this.rolodexList = this.result.rolodexes;
          this.showAdvanceSearchList = true;
        }
        this.focusToRolodexSearch();
      }));
  }
  /** sorts results based on fields
* @param sortFieldBy
*/
  sortResult(sortFieldBy) {
    this.sortCountObj[sortFieldBy]++;
    this.rolodexRequestObject.sortBy = sortFieldBy;
    if (this.sortCountObj[sortFieldBy] < 3) {
      if (this.rolodexRequestObject.sortBy === sortFieldBy) {
        this.sortMap[sortFieldBy] = !this.sortMap[sortFieldBy] ? 'asc' : 'desc';
      }
    } else {
      this.sortCountObj[sortFieldBy] = 0;
      delete this.sortMap[sortFieldBy];
    }
    this.rolodexRequestObject.sort = this.sortMap;
    this.loadRolodex(1);
  }

  /*validates rolodex fields */
  rolodexValidation() {
    const phoneValidationMessage = this.rolodexMap.has('phoneNumber') ? this.rolodexMap.get('phoneNumber') : null;
    this.rolodexMap.clear();
    if (phoneValidationMessage) {
      this.rolodexMap.set('phoneNumber', phoneValidationMessage);
    }
    if (!this.rolodex.fullName && (this.rolodex.organization ?
      !this.rolodex.organizations.organizationName : !this.rolodex.organizationName)) {
      this.rolodexMap.set('name', 'Please enter Full Name or Organization');
    }
    this.emailValidation();
  }

  emailValidation() {
    if (this.rolodex.emailAddress) {
      // tslint:disable-next-line:max-line-length
      const email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)| (".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (!(email.test(String(this.rolodex.emailAddress).toLowerCase()))) {
        this.rolodexMap.set('email', 'Please enter a valid Email Address');
      } else {
        this.rolodexMap.delete('email');
      }
    }
  }

  createNewRolodex() {
    this.clear();
    this.clearDefaultSearchField();
    this.rolodexMap.clear();
    this.isNewRolodex = true;
    this.rolodexName = '';
    this.rolodex = {};
    this.rolodex.rolodexId = null;
    this.genderType = '';
    this.organizationName = '';
    this.isRolodexView = false;
    this.showAdvanceSearchList = false;
    this.rolodex.active = false;
    this.sponsorSearchOptions.defaultValue = '';
    this.organizationCountry = '';
    this.sponsorCountry = '';
    this.organizationHttpOptions.defaultValue = '';
    this.countryHttpOptions.defaultValue = '';
    this.sponsorCountryHttpOptions.defaultValue = '';
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

  selectSponsor(event) {
    if (event) {
      this.rolodex.sponsorCode = event.sponsorCode;
      this.rolodex.sponsor = event;
      this.sponsorCountry = event.country ? event.country.countryName : '';
    } else {
      this.rolodex.sponsorCode = null;
      this.rolodex.sponsor = null;
      this.sponsorCountry = null;
    }
  }

  orgSelectFunction(event) {
    if (event != null) {
      this.rolodex.organization = event.organizationId;
      this.rolodex.organizations = event;
    } else {
      this.organizationHttpOptions.defaultValue = null;
      this.rolodex.organization = null;
      this.rolodex.organizations = null;
    }
  }

  orgEmptyFunction(event) {
    this.organizationHttpOptions.defaultValue = event.searchString;
    this.rolodex.organizations = null;
  }

  phoneNumberValidation(input) {
    this.rolodexMap.delete('phoneNumber');
    // tslint:disable-next-line:max-line-length
    const pattern = (/^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[0-9]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){0,})(?:[\-\.\ \\\/]?(?:#|ext\.?|extension|x)[\-\.\ \\\/]?(\d+))?$/);
    if (!pattern.test(input)) {
      this.checkForInvalidPhoneNumber(input);
    }
  }

  checkForInvalidPhoneNumber(input) {
    if (/^([a-zA-Z]|[0-9a-zA-Z])+$/.test(input)) {
      this.rolodexMap.set('phoneNumber', 'Alphabets cannot be added in  Phone number field.');
    } else {
      this.rolodexMap.set('phoneNumber', 'Please add a valid number');
    }
  }

  countrySelectFunction(countrySelectionEvent) {
    countrySelectionEvent ? (this.rolodex.countryCode = countrySelectionEvent.countryCode, this.rolodex.country = countrySelectionEvent) :
      this.countryEmptyFunction(countrySelectionEvent);
  }
  setPersonCountryProperty(event) {
    this.rolodexRequestObject.property9 = event ? event.countryCode : null;
  }
  setSponsorCountryProperty(event) {
    this.rolodexRequestObject.property11 = event ? event.countryCode : null;
  }
  /**
   * @param {} countryEmptySelectionEvent
   * sets default value (which is used for checking selected country is valid or not) for countryHttpOptions
   * if search for a country which is not in the list
   */
  countryEmptyFunction(countryEmptySelectionEvent) {
    this.countryHttpOptions.defaultValue = countryEmptySelectionEvent ?
      countryEmptySelectionEvent.searchString : countryEmptySelectionEvent;
    this.rolodex.countryCode = null;
    this.rolodex.country = null;
  }
  /**
   * @param
   * sets value for newly added organisation
   */
  newOrganizationSelect(organizationAddEvent) {
    this.rolodex.organization = null;
    this.rolodex.organizationName = organizationAddEvent.searchString;
  }

  clearDefaultSearchField() {
    this.clearField = new String('true');
  }

  setCreateUserProperty(event) {
    this.rolodexRequestObject.property12 = event ? event.prncpl_nm : null;
  }
}
