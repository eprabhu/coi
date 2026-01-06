// Created Ramlekshmy I on 23-11-2019 and Updated By Krishnanunni on 03-12-2019
import { Component, OnInit, Input, OnDestroy, OnChanges } from '@angular/core';
import { Subscription } from 'rxjs';

import { ElasticConfigService } from '../../../common/services/elastic-config.service';
import { ContactService } from './contact.service';
import { CommonDataService } from '../../services/common-data.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { scrollIntoView } from '../../../common/utilities/custom-utilities';
import { CommonService } from '../../../common/services/common.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../app-constants';
declare var $: any;

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css']
})
export class ContactsComponent implements OnInit, OnDestroy, OnChanges {

  @Input() result: any = {};
  @Input() personnelLookupData: any = {};
  @Input() isEditable: boolean;

  contactDataFlag: any = {
    isNonEmployee: false,
    isAddNonEmployeeContactModal: false
  };
  isShowCollapse = true;
  deleteContactIndex: number;
  editIndex: number;
  clearNameField: String;
  contactsElasticOptions: any = {};
  awardContactDetails: any = {
    contactTypeCode: null
  };
  selectedContactMember: any = {};
  selectedPersonDetails: any = {};
  map = new Map();
  isHighlighted: any = false;
  $subscriptions: Subscription[] = [];
  isSaving = false;

  isRolodexViewModal = false;
  type = 'PERSON';
  isTraining = false;
  id: string;
  personDescription: string;
  trainingStatus: string;

  constructor(private _elasticConfig: ElasticConfigService, private _contactService: ContactService,
    private _commonData: CommonDataService, public _commonService: CommonService) { }

  ngOnInit() {
    this.setCommonAwardData();
    this.setElasticPersonOption();
  }
  ngOnChanges() {
    this.isHighlighted = this._commonData.checkSectionHightlightPermission('106');
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  setCommonAwardData() {
    this.awardContactDetails.updateUser = this._commonService.getCurrentUserDetail('userName');
    this.$subscriptions.push(this._commonData.awardData.subscribe((data: any) => {
      if (data && data.award.awardId) {
        this.awardContactDetails.awardId = data.award.awardId;
        this.awardContactDetails.awardNumber = data.award.awardNumber;
        this.awardContactDetails.sequenceNumber = data.award.sequenceNumber;
      }
    }));
  }

  /**setElasticRolodexOption - Set Elastic search option for Fibi rolodex */
  setElasticRolodexOption() {
    this.contactsElasticOptions = this._elasticConfig.getElasticForRolodex();
  }
  /**setElasticPersonOption - Set Elastic search option for Fibi rolodex*/
  setElasticPersonOption() {
    this.contactsElasticOptions = this._elasticConfig.getElasticForPerson();
  }

  /**changeMemberType - if a person is employee then sets person elastic search otherwise sets rolodex elastic search */
  changeMemberType() {
    this.contactsElasticOptions.defaultValue = '';
    this.clearNameField = new String('true');
    this.contactDataFlag.isShowElasticResults = false;
    delete this.awardContactDetails['personId'];
    delete this.awardContactDetails['rolodexId'];
    this.map.clear();
    this.contactDataFlag.isNonEmployee ? this.setElasticRolodexOption() : this.setElasticPersonOption();
  }

  /**clearContactDetails - clears person's Id, and choosed departments if person is cleared or not valid */
  clearContactDetails() {
    delete this.awardContactDetails['personId'];
    delete this.awardContactDetails['rolodexId'];
    this.map.delete('contactfullname');
    this.contactsElasticOptions.errorMessage = null;
    this.contactDataFlag.isShowElasticResults = false;
  }

  /**selectPersonName - sets contact details w.r.t to the contact person type choosed
   * @param value
   */
  selectPersonName(value) {
    if (value) {
      this.selectedContactMember = value;
      !this.contactDataFlag.isNonEmployee ? this.setEmployeeDetails(value) : this.setNonEmployeeDetails(value);
      this.contactDataFlag.isShowElasticResults = true;
    } else {
      this.clearContactDetails();
    }
  }

  /** Bind the value of rolodex to elastic search field after adding new non employee
     * @param rolodexObject
     */
  setRolodexContactObject(rolodexObject) {
    if (rolodexObject.rolodex) {
      this.map.delete('contactfullname');
      this.contactsElasticOptions.errorMessage = null;
      this.clearNameField = new String('false');
      this.contactsElasticOptions.defaultValue = rolodexObject.rolodex.fullName;
      this.awardContactDetails.fullName = rolodexObject.rolodex.fullName;
      this.awardContactDetails.rolodexId = rolodexObject.rolodex.rolodexId;
      this.awardContactDetails.designation = rolodexObject.rolodex.designation;
      this.awardContactDetails.emailAddress = rolodexObject.rolodex.emailAddress;
      this.awardContactDetails.phoneNumber = rolodexObject.rolodex.phoneNumber;
      this.contactDataFlag.isShowElasticResults = true;
      this.selectedContactMember = rolodexObject.rolodex;
    }
    this.contactDataFlag.isAddNonEmployeeContactModal = rolodexObject.nonEmployeeFlag;
    $('#add-contact-modal').modal('show');
  }

  /**saveOrUpdateAwardContact - maintain contact details such us add and edit contact
  * @param  {} type
  * @param  {} index
  */
  saveOrUpdateAwardContact(type) {
    if (this.contactValidation() && !this.isSaving) {
      this.isSaving = true;
      this.setCommonAwardData();
      this.$subscriptions.push(this._contactService.saveOrUpdateAwardContact(this.awardContactDetails).subscribe((data: any) => {
        if (type === 'I') {
          if (this.result.awardContacts) {
            this.result.awardContacts.push(data.awardContact);
          } else {
            this.result.awardContacts = [];
            this.result.awardContacts.push(data.awardContact);
          }
        } else {
          this.result.awardContacts.splice(this.editIndex, 1, data.awardContact);
        }
        if (this.contactDataFlag.isContactEdit) {
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Contact updated successfully.');
        } else {
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Contact added successfully.');
        }
        this.resetContactFields();
        this.updateAwardStoreData();
        this.isSaving = false;
        $('#add-contact-modal').modal('hide');
      }, err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Adding Contact failed. Please try again.');
        this.isSaving = false;
      }
      ));
    }
  }

  /**fetchPersonDetails - To fetch employee details or non-employee details on the basis of personId or rolodexId in 'person'
  * @param  {} person
  */
  fetchPersonDetails(person) {
    this.isRolodexViewModal = true;
    this.personDescription = null;
    if (person.personId) {
      this.id = person.personId;
      this.type = 'PERSON';
    } else {
      this.id = person.rolodexId;
      this.type = 'ROLODEX';
    }
  }

  setPersonRolodexModalView(personRolodexObject) {
    this.isRolodexViewModal = personRolodexObject.isPersonRolodexViewModal;
    this.type = 'PERSON';
  }

  /**
   * @param  {} value
   * To set person id and full name if an employee is selected from elastic search
   */
  setEmployeeDetails(value) {
    this.awardContactDetails.personId = value.prncpl_id;
    this.awardContactDetails.fullName = value.full_name;
    this.awardContactDetails.emailAddress = value.email_addr;
    this.awardContactDetails.phoneNumber = value.phone_nbr;
    this.awardContactDetails.designation = value.primary_title;
  }

  /**
    * @param  {} value
    * To set rolodex id and full name if a non-employee is selected from elastic search
    */
  setNonEmployeeDetails(value) {
    this.awardContactDetails.emailAddress = value.email_address;
    this.awardContactDetails.phoneNumber = value.phone_number;
    this.awardContactDetails.rolodexId = parseInt(value.rolodex_id, 10);
    value.first_name = value.first_name || '';
    value.middle_name = value.middle_name || '';
    value.last_name = value.last_name || '';
    value.organization = !value.organization ? '' : value.organization;
    this.awardContactDetails.fullName = value.full_name ? value.full_name :
      !value.first_name && !value.middle_name && !value.last_name ?
        value.organization : value.last_name + ' , ' + value.middle_name + value.first_name;
    this.awardContactDetails.designation = value.designation;
  }

  /**
  * validation on adding and editing Contact data
  */
  contactValidation() {
    this.map.clear();
    if ((!this.contactDataFlag.isNonEmployee && !this.awardContactDetails.personId) ||
      (this.contactDataFlag.isNonEmployee && !this.awardContactDetails.rolodexId)) {
      this.contactsElasticOptions.errorMessage = 'Please select a person.';
      this.map.set('contactfullname', 'fullname');
    }
     if (this.awardContactDetails.contactTypeCode === 'null' || !this.awardContactDetails.contactTypeCode) {
      this.map.set('type', 'Please select a Contact Type.');
    }
    if (this.result.awardContacts && this.result.awardContacts.length) {
      for (const PERSON of this.result.awardContacts) {
        this.isDuplicatePerson(PERSON);
      }
    }
    return this.map.size ? false : true;
  }

  /**
  * @param {} PERSON
  * Function to check if currently added person under employee is already added and returns true if match found
  */
  isDuplicateEmployee(PERSON) {
    return (!this.contactDataFlag.isNonEmployee && PERSON.personId === this.awardContactDetails.personId) ? true : false;
  }

  /**
   * @param {} PERSON
   * Function to check if currently added person under non-employee is already added and returns true if match found
   */
  isDuplicateNonEmployee(PERSON) {
    return (this.contactDataFlag.isNonEmployee && PERSON.rolodexId === this.awardContactDetails.rolodexId) ? true : false;
  }

  /**
   * @param {} PERSON
   * validation for duplicate person when adding and editing contacts
   */
  isDuplicatePerson(PERSON) {
    if (this.isDuplicateEmployee(PERSON) || this.isDuplicateNonEmployee(PERSON)) {
      if (!PERSON.awardSponsorContactId || (PERSON.awardSponsorContactId !== this.awardContactDetails.awardSponsorContactId)) {
        this.contactsElasticOptions.errorMessage = 'You have already added ' + this.awardContactDetails.fullName + '.';
        this.clearNameField = new String('false');
        this.map.set('contactfullname', 'fullname');
        this.contactDataFlag.isShowElasticResults = false;
      }
    }
  }

  /**getTypeDescription - gets description of contact type based on type code
  * @param  {} contactTypeCode
  */
  getTypeDescription(contactTypeCode) {
    if (Object.entries(this.personnelLookupData).length && this.personnelLookupData.awardContactTypeList.length) {
      return this.personnelLookupData.awardContactTypeList.find(type => type.contactTypeCode === contactTypeCode).description;
    }
  }

  /**resetContactFields - resets the contact details fields*/
  resetContactFields() {
    this.awardContactDetails = {};
    this.awardContactDetails.contactTypeCode = null;
    this.contactDataFlag = {};
    this.contactDataFlag.isWidgetOpen = true;
    this.contactDataFlag.isNonEmployee = false;
    this.setElasticPersonOption();
    this.clearNameField = new String('true');
    this.map.clear();
    this.contactsElasticOptions.errorMessage = null;
  }

  /**editContact - assigns selected contact to be editted to a local instance*/
  editContact() {
    this.map.clear();
    this.selectedContactMember = {};
    this.contactDataFlag.isShowElasticResults = false;
    this.awardContactDetails = JSON.parse(JSON.stringify(this.result.awardContacts[this.editIndex]));
    this.contactDataFlag.isNonEmployee = this.awardContactDetails.personId ? false : true;
    !this.contactDataFlag.isNonEmployee ? this.setElasticPersonOption() : this.setElasticRolodexOption();
    this.contactsElasticOptions.defaultValue = this.awardContactDetails.fullName;
    this.clearNameField = new String('false');
    scrollIntoView('contactType');
  }

  /**deleteContactDetails - delete added contact details w.r.t user selection*/
  deleteContactDetails() {
    this.$subscriptions.push(this._contactService.deleteContact({
      'awardId': this.result.awardContacts[this.deleteContactIndex].awardId,
      'awardPersonalId': this.result.awardContacts[this.deleteContactIndex].awardSponsorContactId,
      'updateUser': this._commonService.getCurrentUserDetail('userName')
    })
      .subscribe((data: any) => {
        this.result.awardContacts.splice(this.deleteContactIndex, 1);
        this.updateAwardStoreData();
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Contact removed successfully.');
      },
      err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Removing Contact failed. Pease try again.');
       }));
  }

  /**
  * setup award common data the values that changed after the service call need to be updatedinto the store.
  * every service call wont have all the all the details as reponse so
  * we need to cherry pick the changes and update them to the store.
  */
  updateAwardStoreData() {
    this.result = JSON.parse(JSON.stringify(this.result));
    this._commonData.setAwardData(this.result);
  }

  /* view personnel details */
  viewPersonDetails() {
    const a = document.createElement('a');
    if (this.selectedPersonDetails.hasOwnProperty('personId')) {
      a.href = '#/fibi/person/person-details?personId=' + this.selectedPersonDetails.personId;
    } else {
      a.href = '#/fibi/rolodex?rolodexId=' + this.selectedPersonDetails.rolodexId;
    }
    a.target = '_blank';
    a.click();
    a.remove();
  }

  /**
  * @param  {} keyPressEvent
  * limit the input field with a-z or A-Z
  */
  onlyAlphabets(keyPressEvent) {
    return (keyPressEvent.charCode > 64 && keyPressEvent.charCode < 91) || (keyPressEvent.charCode > 96 && keyPressEvent.charCode < 123);
  }

  setShowElasticResults(elasticResultShow) {
    this.contactDataFlag.isShowElasticResults = elasticResultShow.isShowElasticResults;
  }

  switchToNonEmployeeModal(){
    $('#add-contact-modal').modal('hide');
  }
}
