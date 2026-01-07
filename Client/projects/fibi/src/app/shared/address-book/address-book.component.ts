import { Component, OnInit, Output, EventEmitter, Input, OnDestroy } from '@angular/core';
import { getCurrentTimeStamp } from '../../common/utilities/date-utilities';
import { getEndPointOptionsForOrganization, getEndPointOptionsForCountry } from '../../common/services/end-point.config';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { CommonService } from '../../common/services/common.service';
import { HTTP_SUCCESS_STATUS, ROLODEX_FULL_NAME } from '../../app-constants';
import { AddressBookService } from './address-book.service';
import { getEndPointOptionsForSponsor } from '../../common/services/end-point.config';

@Component({
  selector: 'app-address-book',
  templateUrl: './address-book.component.html',
  styleUrls: ['./address-book.component.css']
})
export class AddressBookComponent implements OnInit, OnDestroy {
  @Input() isAddNonEmployeeModal;
  @Output() rolodexResult: EventEmitter<any> = new EventEmitter<any>();

  organizationSearchOptions: any = {};
  countryHttpOptions: any = {};
  nonEmployeeMap = new Map();
  genderType = null;
  rolodex: any = {};
  clearField: String;
  clearCountryField: String;
  clearOrgField: String;
  $subscriptions: Subscription[] = [];
  isNameChanged = false;
  isFullNameTyped = false;
  isOrganizationCountryPresent = false;
  isSaving = false;
  sponsorSearchOptions: any = {};

  constructor(private _addressBookService: AddressBookService, public _commonService: CommonService) { }

  ngOnInit() {
    this.sponsorSearchOptions = getEndPointOptionsForSponsor();
    this.organizationSearchOptions = getEndPointOptionsForOrganization();
    this.countryHttpOptions = getEndPointOptionsForCountry();
    this.openAddToAddressBook();
    setTimeout(() => {
      document.getElementById('app-add-non-employee-btn').click();
    });
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
    this.rolodex.fullName = ROLODEX_FULL_NAME.replace("LASTNAME", this.rolodex.lastName).replace("FIRSTNAME", this.rolodex.firstName).replace("MIDDLENAME", this.rolodex.middleName);
    if (!this.rolodex.lastName || (!this.rolodex.middleName && !this.rolodex.firstName)) {
      this.rolodex.fullName = this.rolodex.fullName.replace(',', '');
    }
    this.rolodex.fullName = this.rolodex.fullName.replace(/ {1,}/g, ' ');
    this.rolodex.fullName = this.rolodex.fullName.trim();
  }

  /**
   * @param type
   * This function is triggered whenever a user confirm save from 'Add New Non Employee' Modal.
   */
  saveRolodex(type) {
    this.rolodexValidation();
    if (!this.nonEmployeeMap.size && !this.isSaving) {
      this.isSaving = true;
      this.$subscriptions.push(this._addressBookService.saveRolodexData(this.makeRequestReportData(type)).subscribe((data: any) => {
        if (data && data.message === 'Rolodex saved successfully.') {
          this.rolodex = data.rolodex;
          this.clearRolodexDetails();
          this.emitRolodexResult(data.rolodex);
          document.getElementById('add-non-employee-KP-dissmiss').click();
          this._commonService.showToast(HTTP_SUCCESS_STATUS, data.message);
        } else if (data && data.message === 'Email Address already exists.') {
          this.nonEmployeeMap.set('emailAddress', 'Email Address already exists');
          this.rolodex['genderType'] = null;
        }
        this.isSaving = false;
      }, err => { this.isSaving = false; }));
    }
  }
  /**
   * @param type
   * This function prepares the rolodex object and returns it for saving to database.
   */
  makeRequestReportData(type) {
    const REQUESTREPORTDATA: any = {};
    REQUESTREPORTDATA.acType = type;
    REQUESTREPORTDATA.isAddToAddressBook = true;
    this.rolodex.updateUser = this.rolodex.createUser = this._commonService.getCurrentUserDetail('userName');
    this.rolodex.updateTimestamp = getCurrentTimeStamp();
    this.rolodex.prefix = this.genderType;
    this.rolodex.emailAddress = !this.rolodex.emailAddress ? null : this.rolodex.emailAddress;
    this.rolodex.active = true;
    delete this.rolodex['genderType'];
    REQUESTREPORTDATA.rolodex = this.rolodex;
    return REQUESTREPORTDATA;
  }

  /**
   * @param  {} rolodex
   * This function is triggered whenever we save or close modal to emit the modal condition as false to parent component
   */
  emitRolodexResult(rolodex) {
    this.isAddNonEmployeeModal = false;
    this.rolodexResult.emit({ 'rolodex': rolodex, 'nonEmployeeFlag': this.isAddNonEmployeeModal });
  }

  /* validates rolodex fields */
  rolodexValidation() {
    const phoneValidationMessage = this.nonEmployeeMap.has('phoneNumber') ? this.nonEmployeeMap.get('phoneNumber') : null;
    this.nonEmployeeMap.clear();
    if (phoneValidationMessage) {
      this.nonEmployeeMap.set('phoneNumber', phoneValidationMessage);
    }
    if (!this.rolodex.fullName && (this.rolodex.organization ?
      !this.rolodex.organizations.organizationName : !this.rolodex.organizationName)) {
      this.nonEmployeeMap.set('name', 'Please enter Full Name or Organization');
    }
    this.emailValidation();
  }

  /**
   * Validates whether given E-Mail address is of correct format
   */
  emailValidation() {
    if (this.rolodex.emailAddress) {
      // tslint:disable-next-line:max-line-length
      const email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)| (".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (!(email.test(String(this.rolodex.emailAddress).toLowerCase()))) {
        this.nonEmployeeMap.set('email', 'Please enter a valid Email Address');
      } else {
        this.nonEmployeeMap.delete('email');
      }
    }
  }

  clearRolodexDetails() {
    this.rolodex = {};
    this.clearField = new String('false');
  }

  /* clear fields while opening Add to address book modal */
  openAddToAddressBook() {
    this.nonEmployeeMap.clear();
    this.clearCountryField = new String('true');
    this.clearOrgField = new String('true');
  }

  /**
   * @param {} countrySelectionEvent
   * select country of organisation
   */
  countrySelectFunction(countrySelectionEvent) {
    if (countrySelectionEvent) {
        this.rolodex.country = countrySelectionEvent;
        this.rolodex.countryCode = countrySelectionEvent.countryCode;
    } else {
      this.countryEmptyFunction(countrySelectionEvent);
    }
  }
  /**
   * @param {} countryEmptySelectionEvent
   * sets default value (which is used for checking selected country is valid or not) for countryHttpOptions
   * if search for a country which is not in the list
   */
  countryEmptyFunction(countryEmptySelectionEvent) {
    this.countryHttpOptions.defaultValue = countryEmptySelectionEvent ?
      countryEmptySelectionEvent.searchString : countryEmptySelectionEvent;
    this.rolodex.country = null;
    this.rolodex.countryCode = null;
  }

  /**
   * @param {} organizationSelectionEvent
   * selects organization
   */
  organizationSelectFunction(organizationSelectionEvent) {
    organizationSelectionEvent ? this.setRolodexOrganization(organizationSelectionEvent) :
      this.organizationEmptyFunction(organizationSelectionEvent);
  }

  newOrganizationSelect(organizationAddEvent) {
    this.rolodex.organization = null;
    this.rolodex.organizationName = organizationAddEvent.searchString;
  }
  /**
   * @param {} organizationEmptySelectionEvent
   * empty organization
   */
  organizationEmptyFunction(organizationEmptySelectionEvent) {
    this.organizationSearchOptions.defaultValue = organizationEmptySelectionEvent ?
      organizationEmptySelectionEvent.searchString : organizationEmptySelectionEvent;
    this.countrySelectFunction(null);
    this.setRolodexOrganization(null);
  }

  /**
   * @param {} rolodexObject
   * sets organization object
   */
  setRolodexOrganization(rolodexObject) {
    this.rolodex.organization = rolodexObject ? rolodexObject.organizationId : null;
    this.rolodex.organizations = rolodexObject ? rolodexObject : null;
    this.rolodex.organizationName = rolodexObject ? rolodexObject.organizationName : null;
    this.isOrganizationCountryPresent = false;
    if (rolodexObject && rolodexObject.country) {
      this.rolodex.country = rolodexObject.country;
      this.rolodex.countryCode = rolodexObject.country.countryCode;
      this.clearCountryField = new String('false');
      this.countryHttpOptions.defaultValue = rolodexObject.country.countryName;
      this.isOrganizationCountryPresent = true;
    }
  }

  phoneNumberValidation(input) {
    this.nonEmployeeMap.delete('phoneNumber');
    // tslint:disable-next-line:max-line-length
    const pattern = (/^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[0-9]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){0,})(?:[\-\.\ \\\/]?(?:#|ext\.?|extension|x)[\-\.\ \\\/]?(\d+))?$/);
    if (input && !pattern.test(input)) {
      this.checkForInvalidPhoneNumber(input);
    }
  }

  checkForInvalidPhoneNumber(input) {
    if (/^([a-zA-Z]|[0-9a-zA-Z])+$/.test(input)) {
      this.nonEmployeeMap.set('phoneNumber', 'Alphabets cannot be added in  Phone number field.');
    } else {
      this.nonEmployeeMap.set('phoneNumber', 'Please add a valid number');
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

  selectSponsor(event) {
    if (event) {
      this.rolodex.sponsorCode = event.sponsorCode;
      this.rolodex.sponsor = event;
    } else {
      this.rolodex.sponsorCode = null;
      this.rolodex.sponsor = null;
    }
  }
}
