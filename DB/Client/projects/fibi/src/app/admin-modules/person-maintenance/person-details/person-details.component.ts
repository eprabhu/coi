import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DEFAULT_DATE_FORMAT, HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS } from '../../../app-constants';
import { deepCloneObject, isEmptyObject, setFocusToElement } from '../../../common/utilities/custom-utilities';
import { PersonMaintenanceService, setCompleterOptions } from '../person-maintenance.service';
import { CommonService } from '../../../common/services/common.service';
import { ActivatedRoute, Router } from '@angular/router';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { getDateObjectFromTimeStamp, getCurrentTimeStamp, parseDateWithoutTimestamp } from '../../../common/utilities/date-utilities';
import { getEndPointOptionsForDepartment } from '../../../common/services/end-point.config';
import { Person } from '../person-manitenance.interface';
import { concatUnitNumberAndUnitName } from '../../../common/utilities/custom-utilities';
import { AuditLogService } from '../../../common/services/audit-log.service';

declare var $: any;

@Component({
  selector: 'app-person-details',
  templateUrl: './person-details.component.html',
  styleUrls: ['./person-details.component.css'],
  providers: [AuditLogService,
		{ provide: 'moduleName', useValue: 'PERSON' }]
})
export class PersonDetailsComponent implements OnInit, OnDestroy {

  isPersonView = false;
  searchResults: any = [];
  elasticSearchOptions: any = {};
  debounceTimer: any;
  person: Person = {};
  addPersonEmailWarningMsg: string;
  isPersonEdit = false;
  personId: any;
  showOrHideDataFlagsObj: any = {};
  result: any = {};
  personRequestList: any = [];
  isAdvanceSearchHomeUnitActive;
  map = new Map();
  homeUnitSearchOptions: any = {};
  clearField = new String('false');
  countryClearField = new String('false');
  citizenshipClearField = new String('false');
  sortMap: any = {};
  isPassword = true;
  countrySearchOptions: any = {};
  countryOfCitizenshipSearchOptions: any = {};
  personRequestObject = {
    property1: '', property2: '', property3: '', property4: '', property5: '', property6: '', property7: '',
    property8: '', property9: '', property10: '', pageNumber: 20, sortBy: 'updateTimeStamp', sort: {}, reverse: 'DESC',
    currentPage: 1,
  };
  sortCountObj: any = {
    'personId': 0, 'firstName': 0, 'lastName': 0, 'middleName': 0, 'principalName': 0,
    'emailAddress': 0, 'mobileNumber': 0, 'homeUnit': 0, 'primaryTitle': 0
  };
  isMaintainUserRoles = false;
  isApplicationAdministrator = false;
  datePlaceHolder = DEFAULT_DATE_FORMAT;
  confirmPassword = null;
  isEditPerson = false;
  setFocusToElement = setFocusToElement;
  $subscriptions: Subscription[] = [];
  isMaintainPerson = false;
  isMaintainWorks = false;
  isMaintainDelegation = false;
  hasMaintainTrainingRight = false;
  currentEditPerson: Person = {};
  countries: any = [];
  concatUnitNumberAndUnitName = concatUnitNumberAndUnitName;
  currentUserName = '';
  before = {};
  isPersonActive = false;

  constructor(public _personService: PersonMaintenanceService,
    public _commonService: CommonService, private _activatedRouter: ActivatedRoute,
    private _router: Router, private _auditLogService: AuditLogService) { }

  async ngOnInit() {
    this.map.clear();
    this.isMaintainUserRoles = await this._commonService.checkPermissionAllowed('MAINTAIN_USER_ROLES');
    this.isApplicationAdministrator = await this._commonService.checkPermissionAllowed('APPLICATION_ADMINISTRATOR');
    this.isMaintainPerson = await this._commonService.checkPermissionAllowed('MAINTAIN_PERSON');
    this.isMaintainWorks = await this._commonService.checkPermissionAllowed('MAINTAIN_ORCID_WORKS');
    this.isMaintainDelegation = await this._commonService.checkPermissionAllowed('MAINTAIN_DELEGATION');
    this.hasMaintainTrainingRight = await this._commonService.checkPermissionAllowed('MAINTAIN_TRAINING');
    this.setInitialValues();
    if (this._personService.isPersonEdit) {
      this.getCountry();
    }
  }

  getCountry() {
    this.$subscriptions.push(this._personService.getCountryLookUp().subscribe((data) => {
      this.countries = data;
      this.countrySearchOptions = setCompleterOptions(this.countrySearchOptions, this.countries);
      this.countryOfCitizenshipSearchOptions = setCompleterOptions(this.countryOfCitizenshipSearchOptions, this.countries);
    }));
  }

  setInitialValues() {
    this._personService.isPersonEditOrView = true;
    this.person.isPasswordChange = false;
    this.person.isUsernameChange = false;
    this.homeUnitSearchOptions = getEndPointOptionsForDepartment();
    this.$subscriptions.push(this._activatedRouter.queryParams.subscribe(params => {
      this.personId = params['personId'];
      if (this.personId) {
        if (this.personId === this._commonService.getCurrentUserDetail('personID') || this.isMaintainPerson ) {
          this.loadPersonDetails(this.personId);
        } else {
          this.loadShortDetails(this.personId);
        }
      }
    }));
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  /**
   * Focus on first name field when add person button clicks and also reset home unit search value.
   */
  focusFirstName() {
    setTimeout(() => {
      document.getElementById('person-name').focus();
    }, 0);
    this.homeUnitSearchOptions = Object.assign({}, this.homeUnitSearchOptions);
    this.homeUnitSearchOptions.defaultValue = '';
  }

  citizenshipChangeFunction(event) {
    if (event) {
      this.person.countryOfCitizenshipCode = event.countryCode;
      this.person.countryOfCitizenshipDetails = event;
    } else {
      this.person.countryOfCitizenshipCode = null;
      this.person.countryOfCitizenshipDetails = null;
    }
  }

  countryChangeFunction(event) {
    if (event) {
      this.person.countryCode = event.countryCode;
      this.person.countryDetails = event;
    } else {
      this.person.countryCode = null;
      this.person.countryDetails = null;
    }
  }

  createPerson() {
    this.isPersonEdit = true;
    this.isPersonView = false;
    this.person = {};
    this.person.personId = null;
    this.confirmPassword = null;
    this.person.gender = '';
    this.map.clear();
    this.isEditPerson = false;
  }

  homeUnitChangeFunction(result) {
    if (result) {
      this.person.homeUnit = result.unitNumber;
      this.person.unit = {};
      this.person.unit.unitNumber = result.unitNumber;
      this.person.unit.unitName = result.unitName;
    } else {
      this.person.homeUnit = '';
    }
  }

  setDateValue() {
    this.person.salaryAnniversary = this.person.salaryAnniversary ? getDateObjectFromTimeStamp(this.person.salaryAnniversary) : null;
    this.person.dateOfBirth = this.person.dateOfBirth ? getDateObjectFromTimeStamp(this.person.dateOfBirth) : null;
  }

  editPerson() {
    this.map.clear();
    this.currentEditPerson = JSON.parse(JSON.stringify(this.person));
    this.currentUserName = this.currentEditPerson.principalName || '';
    this.confirmPassword = null;
    this._personService.isPersonEdit = true;
    this.isEditPerson = true;
    this.setDateValue();
    this.person.isPasswordChange = false;
    this.person.isUsernameChange = false;
    this.clearField = new String('false');
    this.countryClearField = new String('false');
    this.citizenshipClearField = new String('false');
    this.countryOfCitizenshipSearchOptions.defaultValue = this.person.countryOfCitizenshipCode ?
      this.person.countryOfCitizenshipCode + '-' + this.person.countryOfCitizenshipDetails.countryName : '';
    this.countrySearchOptions.defaultValue = this.person.countryCode ?
      this.person.countryCode + '-' + this.person.countryDetails.countryName : '';
    this.homeUnitSearchOptions.defaultValue = this.person.unit ?
      concatUnitNumberAndUnitName(this.person.unit.unitNumber, this.person.unit.unitName) : '';
    if (this.countries.length === 0) {
      this.getCountry();
    }
  }

  changeUsername() {
    if (this.currentUserName && this.currentUserName !== this.person.principalName) {
      this.person.isUsernameChange = true;
    } else {
      this.person.isUsernameChange = false;
    }
  }

  cancelPersonEdit() {
    if (this._activatedRouter.snapshot.queryParamMap.get('personId')) {
      this._personService.isPersonEdit = false;
      this.person = JSON.parse(JSON.stringify(this.currentEditPerson));
      this.setIsPersonActiveFlag(this.currentEditPerson.status);
    } else {
      this._personService.isPersonEditOrView = false;
      this._router.navigate(['/fibi/person']);
    }
  }

  loadPersonDetails(personId) {
    this.$subscriptions.push(this._personService.getPersonData(personId).subscribe((data: any) => {
      if (data) {
        this.person = data.person;
        this.setIsPersonActiveFlag(this.person.status);
        this.showOrHideDataFlagsObj.isPersonViewData = true;
        this.showOrHideDataFlagsObj.isOrganizationViewData = true;
        this._personService.personDisplayCard = this.person;
        this.before = this.prepareAuditLog(this.person);
        if (this._personService.isPersonEdit) {
          this.editPerson();
        }
      }
    }, (err) => {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Something went wrong. Please contact Support.');
    }));
  }

  emailValidation() {
    if (this.person.emailAddress) {
      this.person.emailAddress = this.person.emailAddress.trim();
      if (this.person.emailAddress !== undefined && this.person.emailAddress !== '') {
        // tslint:disable-next-line:max-line-length
        const email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)| (".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!(email.test(String(this.person.emailAddress).toLowerCase()))) {
          this.addPersonEmailWarningMsg = 'Please select a valid email address.';
        } else {
          this.addPersonEmailWarningMsg = null;
        }
      }
    }
  }

  /**
 * validates person fields
 */
  personValidation(type) {
    this.map.clear();
    if (!this.person.firstName) {
      this.map.set('personfirstname', 'firstname');
    }
    if (!this.person.lastName) {
      this.map.set('personlastname', 'lastname');
    }
    if (!this.person.fullName) {
      this.map.set('personfullname', 'fullname');
    }
    if (!this.person.principalName) {
      this.map.set('personprincipalname', 'Please enter username.');
    }
    if (!this.person.password && (type !== 'U' || this.person.isPasswordChange)) {
      this.map.set('personpassword', 'password');
    }
    if (!this.isEditPerson || this.person.isPasswordChange) {
      this.confirmUserPassword();
    }
    if (!this.person.emailAddress) {
      this.map.set('personemail', 'email');
    }
    if (!this.person.homeUnit) {
      this.map.set('personhomeunit', 'homeunit');
      this.homeUnitSearchOptions.errorMessage = 'Please select homeunit.';
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

  phoneNumberValidation(input) {
    this.map.clear();
    // tslint:disable-next-line:max-line-length
    const pattern = (/^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[0-9]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){0,})(?:[\-\.\ \\\/]?(?:#|ext\.?|extension|x)[\-\.\ \\\/]?(\d+))?$/);
    if (!pattern.test(input)) {
      this.checkForInvalidPhoneNumber(input);
    }
  }

  checkForInvalidPhoneNumber(input) {
    if (/^([a-zA-Z]|[0-9a-zA-Z])+$/.test(input)) {
      this.map.set('phoneNumber', 'Alphabets cannot be added in Phone number field.');
    } else {
      this.map.set('phoneNumber', 'Please add a valid number');
    }
  }
  /**
 * @param  {} type
 * Insert and  update  person details
 */
  savePerson(type) {
    this.personValidation(type);
    this.emailValidation();
    if ((this.map.size < 1) && (this.addPersonEmailWarningMsg === null ||
      this.addPersonEmailWarningMsg === undefined)) {
      this.person.firstName = this.person.firstName.trim();
      this.person.lastName = this.person.lastName.trim();
      this.person.fullName = this.person.fullName.trim();
      this.person.dateOfBirth = parseDateWithoutTimestamp(this.person.dateOfBirth);
      this.person.salaryAnniversary = parseDateWithoutTimestamp(this.person.salaryAnniversary);
      if (this.person.middleName) {
        this.person.middleName = this.person.middleName.trim();
      }
      const REQUESTREPORTDATA: any = {};
      REQUESTREPORTDATA.acType = type;
      this.person.updateUser = this._commonService.getCurrentUserDetail('userName');
      this.person.updateTimestamp = getCurrentTimeStamp();
      this.person.status = this.isPersonActive ? 'A' : 'I';
      this.changeUsername();
      REQUESTREPORTDATA.person = this.person;

      this.$subscriptions.push(this._personService.maintainPersonData(REQUESTREPORTDATA).subscribe((data: any) => {
        if (data.person) {
          this.person = data.person;
          this.setIsPersonActiveFlag(data.person.status);
          this.setDateValue();
          this.isPersonView = true;
          this.isPersonEdit = false;
          this._personService.isPersonEdit = false;
          this._personService.personDisplayCard = this.person;
          this.showOrHideDataFlagsObj.isPersonViewData = true;
          this.showOrHideDataFlagsObj.isOrganizationViewData = true;
          if (type === 'I') {
              this._router.navigate(['/fibi/person/person-details'], { queryParams: { personId: this.person.personId } });
          }
          this.saveAuditLog(data, type);
          this._commonService.showToast(HTTP_SUCCESS_STATUS, data.message);
        } else {
          this.isPersonView = false;
          this.isPersonEdit = true;
          this.person.status = 'I';
          this._commonService.showToast(HTTP_ERROR_STATUS, data.message);
          this.map.set('personprincipalname', 'Username already exist');
        }
        this.confirmPassword = null;
        this.isEditPerson = true;
      }));
    }
  }

  saveAuditLog(data, acType) {
    let after = this.prepareAuditLog(data.person);
    this._auditLogService.saveAuditLog(acType, acType === 'I' ? {} : this.before, after, null , Object.keys(after), this.person.personId.toString());
  }

  redirectToTrainingMaintenance() {
    this._router.navigate(['/fibi/training-maintenance'],
      { queryParamsHandling: 'merge', queryParams: { personId: this.person.personId, name: this.person.fullName } });
  }
  /**selected sort field is assigned to the sort request object.
   * sort field value is  incremented  and condition is check for assigning the sort type into sort  array object,
   *  which allows multiple sorting.
  * @param sortFieldBy
  */
  sortResult(sortFieldBy) {
    this.sortCountObj[sortFieldBy]++;
    this.personRequestObject.sortBy = sortFieldBy;
    if (this.sortCountObj[sortFieldBy] < 3) {
      if (this.personRequestObject.sortBy === sortFieldBy) {
        this.sortMap[sortFieldBy] = !this.sortMap[sortFieldBy] ? 'asc' : 'desc';
      }
    } else {
      this.sortCountObj[sortFieldBy] = 0;
      delete this.sortMap[sortFieldBy];
    }
    this.personRequestObject.sort = this.sortMap;
    this.loadPersonList();
  }
  /**
   * Load person list for advance search and sorting
   */
  loadPersonList() {
    this.$subscriptions.push(this._personService.getPersonList(this.personRequestObject)
      .subscribe(data => {
        this.result = data || [];
        if (this.result !== null) {
          if (this.result.persons.length) {
            this.personRequestList = this.result.persons;
          } else {
            this.personRequestList = null;
          }
          // else if (this.result.persons.length === 1 && !this.isAdvanceSearch) {
          //   this.personRequestList = null;
          //   this.person = this.result.persons[0];
          //   this.isPersonView = true;
          //   this.showOrHideDataFlagsObj.isPersonViewData = true;
          //   this.showOrHideDataFlagsObj.isOrganizationViewData = true;
          // }
        }
      }));
  }
  confirmUserPassword() {
    if (this.person.password) {
      if (!this.confirmPassword) {
        this.map.set('confirmPersonPassword', 'Please confirm password');
      }
      if (this.confirmPassword && (this.person.password !== this.confirmPassword)) {
        this.map.set('confirmPersonPassword', 'Password does not match.');
      }
    } else {
      this.map.set('confirmPersonPassword', 'Please enter password.');
    }
  }

  loadShortDetails(personID) {
    this.$subscriptions.push(this._personService.getPersonInformation(personID).subscribe(data => {
      if (data) {
        this.person = data;
        this.showOrHideDataFlagsObj.isPersonViewData = true;
        this.showOrHideDataFlagsObj.isOrganizationViewData = true;
        this._personService.personDisplayCard = this.person;
      }
    }, (err) => {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Something went wrong. Please contact Support.');
    }));
  }

  private prepareAuditLog(person): any {
    let personAuditLog = deepCloneObject(person);
    const EXCLUDED_VALUES = ['countryCode', 'country','countryDetails','countryOfCitizenshipCode','countryOfCitizenshipDetails','orcidId','unit','supervisorPersonId','updateTimestamp']
    Object.keys(personAuditLog).forEach(key => {
      if (key == 'dateOfBirth' || key == 'salaryAnniversary' ) {
        personAuditLog[key] = parseDateWithoutTimestamp(personAuditLog[key]) || '--NONE--';
      } else if (['isFaculty', 'isGraduateStudentStaff', 'isMedicalStaff', 'isOtherAcadamic', 'isResearchStaff', 'isServiceStaff', 'isSupportStaff'].includes(key)) {
        personAuditLog[key] = personAuditLog[key]  || false;
      } else if (!EXCLUDED_VALUES.includes(key)) {
        personAuditLog[key] = personAuditLog[key] || "--NONE--";
      } else {
        delete personAuditLog[key];
      }
    });
    personAuditLog['COUNTRY'] =  person.countryCode ? `${person.countryCode}-${person.countryDetails.countryName}` : "--NONE--";
    personAuditLog['COUNTRY OF CITIZENSHIP'] =  person.countryOfCitizenshipCode ? `${person.countryOfCitizenshipCode} - ${person.countryOfCitizenshipDetails.countryName}` : "--NONE--";
    personAuditLog['UNIT'] =  person.unit && !isEmptyObject(person.unit) ? `${person.unit.unitNumber}-${person.unit.unitName}` : "--NONE--";
    return personAuditLog;
  }

  setIsPersonActiveFlag(status: string): void {
    this.isPersonActive = status === 'A' ? true : false;
  }

}
