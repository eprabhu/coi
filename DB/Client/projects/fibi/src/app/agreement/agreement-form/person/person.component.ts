import { Component, OnInit, OnDestroy } from '@angular/core';
import { ElasticConfigService } from '../../../common/services/elastic-config.service';
import { AgreementService } from '../../agreement.service';
import { Subscription } from 'rxjs';
import { AgreementCommonDataService } from '../../agreement-common-data.service';
import { HTTP_SUCCESS_STATUS } from '../../../app-constants';
import { CommonService } from '../../../common/services/common.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
declare var $: any;

@Component({
  selector: 'app-person',
  templateUrl: './person.component.html',
  styleUrls: ['./person.component.css']
})
export class PersonComponent implements OnInit, OnDestroy {

  personElasticSearchOptions: any = {};
  negotiatorElasticSearchOptions: any = {};
  $subscriptions: Subscription[] = [];
  result: any = {};
  map = new Map();
  personRoleType: any;
  agreementPerson: any = {};
  deletePersonId = null;
  editPersonIndex = null;
  isPersonEditMode = false;
  isFetchedFirstTime = false;
  isShowPerson = true;
  personType = 'EMPLOYEE';


  isRolodexViewModal = false;
  type = 'PERSON';
  isTraining = false;
  id: string;
  personDescription: string;
  trainingStatus: string;

  isNonEmployeeChecked = false;
  showAddToAddressBookModal = false;
  clearField: String;
  selectedContactMember: any = {};
  isShowElasticResults = false;

  constructor(private _elasticConfig: ElasticConfigService, public _commonAgreementData: AgreementCommonDataService,
    private _agreementService: AgreementService, private _commonService: CommonService) { }

  ngOnInit() {
    this.getAgreementGeneralData();
    this.agreementPerson.piPersonnelTypeCode = null;
  }

  setDefaultPersonType() {
    this.agreementPerson.peopleTypeId =  !this.result.agreementPeoples.length ? '3' : null;
  }

  getAgreementGeneralData() {
    this.$subscriptions.push(this._commonAgreementData.$agreementData.subscribe((data: any) => {
      if (data) {
        if (this.isFetchedFirstTime) {
          data.agreementPeoples = this.result.agreementPeoples;
        }
        this.result = JSON.parse(JSON.stringify(data));
        this.setPersonSearchOptions();
        this.isPersonEditMode = this._commonAgreementData.getSectionEditPermission('101');
      }
    }));
  }

  selectedPerson(result) {
    if (result) {
      this.selectedContactMember = result;
      this.isShowElasticResults = true;
      this.agreementPerson.personId = result.prncpl_id || null;
      this.agreementPerson.rolodexId = result.rolodex_id || null;
      this.agreementPerson.fullName = result.full_name;
      this.agreementPerson.phoneNumber = result.phone_nbr || result.phone_number;
      this.agreementPerson.email =  result.email_addr || result.email_address;
      this.agreementPerson.department = result.unit_name || result.organization;
    } else {
      this.isShowElasticResults = false;
      this.clearPersonDetails();
    }
  }

  clearPersonDetails() {
    this.agreementPerson.personId = null;
    this.agreementPerson.fullName = null;
    this.agreementPerson.phoneNumber = null;
    this.agreementPerson.email = null;
    this.agreementPerson.department = null;
  }

  clearPersonData() {
    this.isShowElasticResults = false;
    this.agreementPerson = {};
    this.agreementPerson.peopleTypeId = null;
    this.agreementPerson.piPersonnelTypeCode = null;
    this.editPersonIndex = null;
    this.map.clear();
    this.editPersonIndex = null;
    this.personType = 'EMPLOYEE';
    this.setPersonSearchOptions();
  }

  /**
   * Checks person repeatition seperately for institutional and non institutional person types
   */
  personRepeatValidation() {
    return this.agreementPerson.peopleTypeId == 1 ? this.checkInstitutionalPerson() : this.checkNonInstitutionalPerson();
  }

  /**
   * returns true if an institutional person with same role repeats
   */
  checkInstitutionalPerson() {
    const INDEX = this.result.agreementPeoples.findIndex(person =>
      person.peopleTypeId == this.agreementPerson.peopleTypeId &&
      ((this.agreementPerson.personId && person.personId == this.agreementPerson.personId) || 
      (this.agreementPerson.rolodexId && person.rolodexId == this.agreementPerson.rolodexId))&&
      person.piPersonnelTypeCode == this.agreementPerson.piPersonnelTypeCode);
    return INDEX > -1 && INDEX !== this.editPersonIndex ? true : false;
  }

  /**
   * returns true if a non institutional person repeats
   */
  checkNonInstitutionalPerson() {
    const INDEX = this.result.agreementPeoples.findIndex(person =>
      person.peopleTypeId == this.agreementPerson.peopleTypeId &&
      ((this.agreementPerson.personId && person.personId == this.agreementPerson.personId) || 
      (this.agreementPerson.rolodexId && person.rolodexId == this.agreementPerson.rolodexId)));
    return INDEX > -1 && INDEX !== this.editPersonIndex ? true : false;
  }

  validatePerson() {
    this.map.clear();
    if (!this.agreementPerson.peopleTypeId || this.agreementPerson.peopleTypeId == 'null') {
      this.map.set('type', '* Please select a Role');
    }
    if (!this.agreementPerson.personId && !this.agreementPerson.rolodexId) {
      this.map.set('personId', '* Please select Person');
    }
    if (!this.agreementPerson.peopleTypeId) {
        this.map.set('role', '* Please select Person Role');
    }
    if (this.personRepeatValidation()) {
      this.map.set('person', '* You have already added this person.');
    }
    return this.map.size > 0 ? false : true;
  }

  saveOrUpdatePerson() {
    if (this.validatePerson()) {
      this.setRequestObject();
      this.$subscriptions.push(this._agreementService.saveAgreementPeople(this.agreementPerson).subscribe((data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS,this.editPersonIndex == null ?'Person saved successfully.':'Person updated successfully.');
        this.result.agreementPeoples = data.agreementPeoples;
        this._commonAgreementData.setAgreementData(this.result);
        this.clearPersonData();
        this.personType = 'EMPLOYEE';
        $('#add-people-modal').modal('hide');
      }));
    }
  }

  setRequestObject() {
    this.agreementPerson.agreementPeopleType =
      this.result.agreementPeopleType.find(item => item.peopleTypeId == this.agreementPerson.peopleTypeId);
    this.agreementPerson.piPersonnelType =
      this.result.negotiationsPersonnelTypes.find(item => item.personnelTypeCode == this.agreementPerson.piPersonnelTypeCode);
    this.agreementPerson.updateUser = this._commonService.getCurrentUserDetail('userName');
    this.agreementPerson.agreementRequestId = this.result.agreementHeader.agreementRequestId;
  }

  editPerson(person, index) {
    this.isShowElasticResults = false;
    this.agreementPerson = Object.assign({}, person);
    this.personType = this.agreementPerson.personId ? 'EMPLOYEE' : 'NON_EMPLOYEE';
    this.setPersonSearchOptions();
    this.personElasticSearchOptions.defaultValue = this.agreementPerson.fullName;
    this.editPersonIndex = index;
  }

  deleteAgreementPeople() {
    this.$subscriptions.push(this._agreementService.deleteAgreementPeople
      ({ agreementPeopleId: this.deletePersonId }).subscribe((data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS,'Person deleted successfully.');
        this.result.agreementPeoples = data.agreementPeoples;
        this._commonAgreementData.setAgreementData(this.result);
        this.clearPersonData();
        this.setDefaultPersonType();
      }));
  }

  setPersonSearchOptions(): void {
    this.isShowElasticResults = false;
    this.map.clear();
    this.personElasticSearchOptions = this.personType == 'EMPLOYEE' ?
      this._elasticConfig.getElasticForPerson() : this._elasticConfig.getElasticForRolodex();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  fetchPersonDetails(person) {
    this.isRolodexViewModal = true;
    this.personDescription = person.agreementPeopleType.description;
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

  setRolodexTeamObject(rolodexObject) {
    if (rolodexObject.rolodex) {
      this.clearPersonDetails();
      this.setPersonSearchOptions();
      this.personType = 'NON_EMPLOYEE';
      this.personElasticSearchOptions.defaultValue = rolodexObject.rolodex.fullName;
      this.agreementPerson.fullName = rolodexObject.rolodex.fullName;
      this.agreementPerson.email = rolodexObject.rolodex.emailAddress;
      this.agreementPerson.phoneNumber = rolodexObject.rolodex.phoneNumber;
      this.agreementPerson.rolodexId = rolodexObject.rolodex.rolodexId;
      if (rolodexObject.rolodex.organization) {
        this.agreementPerson.department = rolodexObject.rolodex.organization.organizationName;
      } else {
        this.agreementPerson.department = rolodexObject.rolodex.organizationName;
      }
      this.isShowElasticResults = true;
      this.selectedContactMember = rolodexObject.rolodex;
    }
    this.showAddToAddressBookModal = rolodexObject.nonEmployeeFlag;
    $('#add-people-modal').modal('show');
  }
 
  hideAddPeopleModal() {
    $('#add-people-modal').modal('hide');
    setTimeout(() => {
    this.showAddToAddressBookModal = true;
    });
  }

  setShowElasticResults(elasticResultShow) {
    this.isShowElasticResults = elasticResultShow.isShowElasticResults;
  }


}

