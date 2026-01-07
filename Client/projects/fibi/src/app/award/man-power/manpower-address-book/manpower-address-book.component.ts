import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { CommonService } from '../../../common/services/common.service';
import { getEndPointOptionsForCountry, getEndPointOptionsForOrganization } from '../../../common/services/end-point.config';
import { getCurrentTimeStamp } from '../../../common/utilities/date-utilities';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { AddressBookService } from '../../../shared/address-book/address-book.service';

@Component({
  selector: 'app-manpower-address-book',
  templateUrl: './manpower-address-book.component.html',
  styleUrls: ['./manpower-address-book.component.css']
})
export class ManpowerAddressBookComponent implements OnInit, OnDestroy {
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
  newOrganizationName = {
    organizationId: '',
    organizationName: ''
  };

  constructor(private _addressBookService: AddressBookService, public _commonService: CommonService) { }

  ngOnInit() {
    this.organizationSearchOptions = getEndPointOptionsForOrganization();
    this.countryHttpOptions = getEndPointOptionsForCountry();
    this.openAddToAddressBook();
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
    this.isFullNameTyped = this.rolodex.fullName ? this.isFullNameTyped : false;
    if (!this.isFullNameTyped && this.isNameChanged) {
      this.rolodex.firstName = this.rolodex.firstName ? this.rolodex.firstName : '';
      this.rolodex.middleName = this.rolodex.middleName ? this.rolodex.middleName : '';
      this.rolodex.lastName = this.rolodex.lastName ? this.rolodex.lastName : '';
      this.rolodex.fullName = this.rolodex.firstName + ' ' + this.rolodex.middleName + ' ' + this.rolodex.lastName;
      this.rolodex.fullName = this.rolodex.fullName.replace(/ {1,}/g, ' ');
      this.rolodex.fullName = this.rolodex.fullName.trim();
      this.isNameChanged = false;
    }
  }

  /**
   * @param type
   * This function is triggered whenever a user confirm save from 'Add New Non Employee' Modal.
   */
  saveRolodex(type) {
    this.rolodexValidation();
    if (!this.nonEmployeeMap.size) {
      this.$subscriptions.push(this._addressBookService.saveRolodexData(this.makeRequestReportData(type)).subscribe((data: any) => {
        if (data && data.message === 'Rolodex saved successfully.') {
          this.rolodex = data.rolodex;
          this.clearRolodexDetails();
          this.emitRolodexResult(data.rolodex);
          this._commonService.showToast(HTTP_SUCCESS_STATUS, data.message);
        } else if (data && data.message === 'Email Address already exists.') {
          this.nonEmployeeMap.set('emailAddress', 'Email Address already exists');
          this.rolodex['genderType'] = null;
        }
      }, err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, "Saving Rolodex failed. Please try again.");
      }));
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
    if (!this.rolodex.emailAddress) {
      this.nonEmployeeMap.set('email', 'Please provide valid Email Address.');
    }
    if (phoneValidationMessage) {
      this.nonEmployeeMap.set('phoneNumber', phoneValidationMessage);
    }
    if (!this.rolodex.fullName) {
      this.nonEmployeeMap.set('fullName', '* Please provide Full Name');
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
    } else {
      this.nonEmployeeMap.set('email', '* Please provide Email Address');
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
    countrySelectionEvent ? (this.rolodex.organizations.countryCode = countrySelectionEvent.countryCode) :
      this.countryEmptyFunction(countrySelectionEvent);
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
    this.newOrganizationName.organizationName = organizationAddEvent.searchString;
    this.newOrganizationName.organizationId = null;
    this.rolodex.organization = null;
    this.rolodex.organizations = this.newOrganizationName;
    this.rolodex.organizations.isActive = true;
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
    this.isOrganizationCountryPresent = false;
    if (rolodexObject && rolodexObject.country) {
      this.rolodex.countryCode = rolodexObject.country.countryCode;
      this.countrySelectFunction(rolodexObject.country);
      this.clearCountryField = new String('false');
      this.countryHttpOptions.defaultValue = rolodexObject.country.countryName;
      this.isOrganizationCountryPresent = true;
    }
  }

  phoneNumberValidation(input) {
    this.nonEmployeeMap.delete('phoneNumber');
    // tslint:disable-next-line:max-line-length
    const pattern = (/^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[0-9]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){0,})(?:[\-\.\ \\\/]?(?:#|ext\.?|extension|x)[\-\.\ \\\/]?(\d+))?$/);
    if (!pattern.test(input)) {
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
}
