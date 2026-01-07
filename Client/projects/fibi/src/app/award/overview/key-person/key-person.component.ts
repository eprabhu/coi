/** Last updated by Greeshma on 05-05-2020 */
import { Component, OnInit, Input, OnDestroy, OnChanges } from '@angular/core';
import { Subscription, Subject } from 'rxjs';

import { getCurrentTimeStamp } from '../../../common/utilities/date-utilities';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS, KEY_PERSON_LABEL } from '../../../app-constants';

import { ElasticConfigService } from '../../../common/services/elastic-config.service';
import { CommonDataService } from '../../services/common-data.service';
import { CommonService } from '../../../common/services/common.service';
import { KeyPersonService } from './key-person.service';
import { getEndPointOptionsForDepartment } from '../../../common/services/end-point.config';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { fileDownloader, scrollIntoView, setHelpTextForSubItems, validatePercentage } from '../../../common/utilities/custom-utilities';
import { WafAttachmentService } from '../../../common/services/waf-attachment.service';
import { environment } from '../../../../environments/environment';
import {concatUnitNumberAndUnitName} from '../../../common/utilities/custom-utilities';
import { HttpErrorResponse } from '@angular/common/http';
declare var $: any;

@Component({
  selector: 'app-key-person',
  templateUrl: './key-person.component.html',
  styleUrls: ['./key-person.component.css'],
  providers: [WafAttachmentService]
})
export class KeyPersonComponent implements OnInit, OnDestroy, OnChanges {

  isPersonCard = false;
  personDetails: any = {
    awardId: '',
    personRoleId: '',
    awardPersonUnits: [],
    isMultiPi: false,
    department: '',
    projectRole: null
  };
  unitSearchOptions: any = {};
  clearUnitField;
  isKeyPersonEdit = false;
  isEmployeeFlag = true;
  deleteindex: any;
  keyPersonElasticOptions: any = {};
  clearField: String;
  replaceAttachmentId = null;
  proposalPersonRole: any = [];
  uploadedFile = [];
  awardData: any;
  selectedPersonDetails: any = {};
  isShowCollapse = true;
  selectedMemberObject: any = {};
  isAddNonEmployeeModal = false;
  isUnitExist = false;
  $unitList = new Subject();
  deleteAwardCV: any;
  keyPersonDetails: any = {};
  isEnableViewMore = false;
  isMaintainRolodex = false;
  isMaintainPerson = false;
  concatUnitNumberAndUnitName = concatUnitNumberAndUnitName;

  @Input() map: any = {};
  @Input() result: any = {};
  @Input() personnelLookupData: any = {};
  @Input() isEditable: boolean;
  @Input() helpText: any = {};
  isHighlighted: any = false;
  $subscriptions: Subscription[] = [];
  isEditIndex: any;
  deployMap = environment.deployUrl;
  isSaving = false;

  isRolodexViewModal = false;
  type = 'PERSON';
  isTraining = false;
  id: string;
  personDescription: string;
  trainingStatus: string;

  constructor(private _elasticConfig: ElasticConfigService, public _commonData: CommonDataService,
    public _commonService: CommonService, private _keyPersonService: KeyPersonService,
    private _wafAttachmentService: WafAttachmentService) { }

  ngOnInit() {
    this.map.clear();
    this.setCommonAwardData();
    this.setElasticPersonOption();
    this.getPermissions();
    this.unitSearchOptions = Object.assign({}, getEndPointOptionsForDepartment());
    this.$subscriptions.push(this.$unitList.subscribe(data => {
      this.checkIfUnitExist();
    }));
  }

  ngOnChanges() {
    if (Object.entries(this.personnelLookupData).length > 0) {
      this.changeRoleTypesArray();
    }
    this.isHighlighted = this._commonData.checkSectionHightlightPermission('104');
    if (Object.keys(this.helpText).length && this.helpText.keyPersons && this.helpText.keyPersons.parentHelpTexts.length) {
      this.helpText = setHelpTextForSubItems(this.helpText, 'keyPersons');
    }
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
  /**checkIfUnitExist - isUnitExist false units are empty or all the units are deleted.
   * isUnitExist is used to change the placeholder and information message of department
   * method is called each time a change is occured in awardPersonUnits array
  */
  checkIfUnitExist() {
    this.isUnitExist = this.personDetails.awardPersonUnits.length === 0 ||
      this.personDetails.awardPersonUnits.every(unit => unit.isDeleted) ? false : true;
  }

  /**setElasticPersonOption - Set Elastic search option for Fibi Person */
  setElasticPersonOption() {
    this.keyPersonElasticOptions = this._elasticConfig.getElasticForPerson();
  }

  /**setElasticRolodexOption - Set Elastic search option for Fibi rolodex */
  setElasticRolodexOption() {
    this.keyPersonElasticOptions = this._elasticConfig.getElasticForRolodex();
  }

  /**selectedMemberName - assigns elastic result to an member object and desired function is called as per person type
   * @param  {} value
   */
  selectedMemberName(value) {
    this.isPersonCard = false;
    this.clearUnits();
    if (value) {
      this.isPersonCard = true;
      this.selectedMemberObject = value;
      this.personDetails.designation = this.isEmployeeFlag ? value.primary_title : value.designation;
      this.isEmployeeFlag ? this.setEmployeeDetails(value) : this.setNonEmployeeDetails(value);
      if (value.unit_number) {
        this.prepareUnitObject(value.unit_number, value.unit_name, true);
      }
    } else {
      this.clearPersonDetails();
    }
  }

   /** Bind the value of rolodex to elastic search field after adding new non employee
   */
  setRolodexPersonObject(rolodexObject) {
    if (rolodexObject.rolodex) {
      this.clearField = new String('false');
      this.keyPersonElasticOptions.errorMessage = null;
      this.map.delete('personfullname');
      this.keyPersonElasticOptions.defaultValue = rolodexObject.rolodex.fullName;
      this.personDetails.fullName = rolodexObject.rolodex.fullName;
      this.personDetails.rolodexId = rolodexObject.rolodex.rolodexId;
      this.personDetails.designation = rolodexObject.rolodex.designation;
      if (rolodexObject.rolodex.organization) {
        this.personDetails.department = rolodexObject.rolodex.organizations ?
        rolodexObject.rolodex.organizations.organizationName : '';
       } else {
        this.personDetails.department = rolodexObject.rolodex.organizationName ?
        rolodexObject.rolodex.organizationName : '';
       }
      this.selectedMemberObject = rolodexObject.rolodex;
      this.isPersonCard = true;
    }
    $('#add-key-person-modal').modal('show');
    this.isAddNonEmployeeModal = rolodexObject.nonEmployeeFlag;
  }

  /**setEmployeeDetails - To set person id and full name if an employee is selected from elastic search
  * @param  {} value
  */
  setEmployeeDetails(value) {
    this.personDetails.personId = value.prncpl_id;
    this.personDetails.fullName = value.full_name;
  }

  /**setNonEmployeeDetails - To set rolodex id and full name if a non-employee is selected from elastic search
  * @param  {} value
  */
  setNonEmployeeDetails(value) {
    this.personDetails.rolodexId = parseInt(value.rolodex_id, 10);
    value.first_name = value.first_name || '';
    value.middle_name = value.middle_name || '';
    value.last_name = value.last_name || '';
    value.organization = !value.organization ? '' : value.organization;
    this.personDetails.fullName = value.full_name ? value.full_name :
      !value.first_name && !value.middle_name && !value.last_name ?
        value.organization : value.last_name + ' , ' + value.middle_name + value.first_name;
    this.personDetails.department = value.organization;
  }


  clearUnits() {
    if (this.personDetails.awardPersonUnits !== 0) {
      this.clearLeadUnitFlag();
      this.clearUnSavedDepartments();
      this.clearSavedDepartments();
    }
  }

  /** prepareUnitObject - prepares and push selected department into list of
   *  departments if there is no duplication
   * */
  prepareUnitObject(unitNumber, unitName, isLeadUnit) {
    const unitDetails: any = {
      awardId: this.personDetails.awardId,
      awardNumber: this.personDetails.awardNumber,
      sequenceNumber: this.personDetails.sequenceNumber,
      isDeleted: false,
      leadUnitFlag: isLeadUnit,
      unit: {
        unitName: unitName,
        unitNumber: unitNumber
      },
      unitNumber: unitNumber,
      updateTimestamp: getCurrentTimeStamp,
      updateUser: this._commonService.getCurrentUserDetail('userName')
    };
    this.personDetails.awardPersonUnits.push(unitDetails);
    this.$unitList.next();
  }

  /**triggerUnitChange - method is triggered when a department is chosed from the list and validates it.
   * @param {} result
  */
  triggerUnitChange(result) {
    if (result) {
      this.validateUnitSelected(result);
    }
  }

  /**validateUnitSelected - validates if duplicate department is added if unitNumber is same and unit is not deleted
   * @param {} result
   */
  validateUnitSelected(result) {
    this.clearUnitField = new String('true');
    const keyUnit = this.personDetails.awardPersonUnits.find(unit => unit.unitNumber === result.unitNumber && !unit.isDeleted);
    keyUnit ? this.unitSearchOptions.errorMessage = 'Department already added' : this.setUnitDetails(result);
  }

  setUnitDetails(result: any) {
    this.prepareUnitObject(result.unitNumber, result.unitName, this.checkLeadUnitAdded());
    this.unitSearchOptions.errorMessage = null;
  }

  checkLeadUnitAdded() {
    return !this.personDetails.awardPersonUnits.length ? true : false;
  }

  /**limitKeypress - limit the input field b/w 0 and 100 with 2 decimal points
   * @param {} value
   */
  limitKeypress(value) {
    this.map.delete('percentageOfEffort');
    if (validatePercentage(value)) {
      this.map.set('percentageOfEffort', validatePercentage(value));
    }
  }

  /**clearUnSavedDepartments - Clears departments of earlier chosed person if they were not saved*/
  clearUnSavedDepartments() {
    const index = this.personDetails.awardPersonUnits.findIndex((element) => !element.awardPersonUnitId);
    if (index !== -1) {
      this.personDetails.awardPersonUnits.splice(index, this.personDetails.awardPersonUnits.length);
      this.$unitList.next();
    }
  }

  /**clearSavedDepartments - sets isDeleted = true for departments of earlier chosed person if they were saved*/
  clearSavedDepartments() {
    if (this.personDetails.awardPersonUnits.some(unit => unit.awardPersonUnitId)) {
      this.personDetails.awardPersonUnits.forEach((element, index) => {
        if (element.awardPersonUnitId) {
          this.personDetails.awardPersonUnits[index].isDeleted = true;
        }
      });
      this.$unitList.next();
    }
  }

  /**deleteDepartment - isDeleted is set true to delete already saved departments from db,
   * otherwise just splices the array from the view
   * */
  deleteDepartment(index) {
    this.personDetails.awardPersonUnits[index].leadUnitFlag = false;
    this.personDetails.awardPersonUnits[index].awardPersonUnitId ? this.personDetails.awardPersonUnits[index].isDeleted = true :
      this.personDetails.awardPersonUnits.splice(index, 1);
    this.$unitList.next();
  }

  editKeyPerson(index) {
    this.map.clear();
    this.isKeyPersonEdit = true;
    this.isEditIndex = index;
    this.selectedMemberObject = {};
    this.isPersonCard = false;
    this.unitSearchOptions.errorMessage = null;
    this.personDetails = JSON.parse(JSON.stringify(this.result.awardPersons[index]));
    this.isEmployeeFlag = this.personDetails.personId ? true : false;
    this.isEmployeeFlag ? this.setElasticPersonOption() : this.setElasticRolodexOption();
    this.changeRoleTypesArray();
    this.personDetails.personRoleId = this.personDetails.proposalPersonRole.id;
    this.clearField = new String('false');
    this.keyPersonElasticOptions.defaultValue = this.personDetails.fullName;
    this.replaceAttachmentId = this.personDetails.awardPersonAttachment && this.personDetails.awardPersonAttachment.length !== 0 ?
      this.personDetails.awardPersonAttachment[0].attachmentId : null;
    this.$unitList.next();
    scrollIntoView('employeeRadioButtonId');
  }

  deletePerson(deleteindex) {
    this.$subscriptions.push(this._keyPersonService.deleteKeyPersonnel({
      'awardId': this.result.awardPersons[deleteindex].awardId,
      'awardPersonalId': this.result.awardPersons[deleteindex].awardPersonId,
      'updateUser': this._commonService.getCurrentUserDetail('userName')
    }).subscribe((data: any) => {
      this.result.awardPersons.splice(deleteindex, 1);
      this.result.award.principalInvestigator = data.awardPIPerson;
      this.updateAwardStoreData();
      this._commonService.showToast(HTTP_SUCCESS_STATUS, `${KEY_PERSON_LABEL} removed successfully.`);
    },
    (err) => {
      this._commonService.showToast(HTTP_ERROR_STATUS, `Removing ${KEY_PERSON_LABEL}  failed. Please try again.`);
    }));
  }

  /** changeMemberType - if a person is employee then sets fibiperson elastic search otherwise sets fibirolodex elastic search */
  changeMemberType() {
    this.clearField = new String('true');
    this.keyPersonElasticOptions.defaultValue = '';
    this.isPersonCard = false;
    delete this.personDetails['personId'];
    delete this.personDetails['rolodexId'];
    this.personDetails.fullName = null;
    this.clearUnits();
    this.map.clear();
    (this.isEmployeeFlag) ? this.setElasticPersonOption() : this.setElasticRolodexOption();
  }

  /*changeRoleTypesArray - change role types according to change in Multi-PI checkbox */
  changeRoleTypesArray() {
    this.personDetails.personRoleId = null;
    this.proposalPersonRole = this.personDetails.isMultiPi ?
      this.personnelLookupData.proposalPersonRoles.filter(roleTypeObject =>
        roleTypeObject.isMultiPi === 'Y' || roleTypeObject.isMultiPi === 'D' || !roleTypeObject.isMultiPi) :
      this.personnelLookupData.proposalPersonRoles.filter(roleTypeObject =>
        roleTypeObject.isMultiPi === 'N' || roleTypeObject.isMultiPi === 'D' || !roleTypeObject.isMultiPi);
  }

  /**keyPersonValidation - validation on adding and editing keypersonnal data */
  keyPersonValidation() {
    this.map.clear();
    this.keyPersonElasticOptions.errorMessage = this.unitSearchOptions.errorMessage = null;
    this.validateMandatoryFields();
    if (this.result.awardPersons && this.result.awardPersons.length) {
      for (const PERSON of this.result.awardPersons) {
        this.isDuplicatePerson(PERSON);
        this.isDuplicatePI(PERSON);
      }
    }
    return this.map.size ? false : true;
  }

  validateMandatoryFields() {
    if ((this.isEmployeeFlag && !this.personDetails.personId) || (!this.isEmployeeFlag && !this.personDetails.rolodexId)) {
      this.keyPersonElasticOptions.errorMessage = 'Please provide a person name.';
      this.map.set('personfullname', 'fullname');
    }
    this.limitKeypress(this.personDetails.percentageEffort);
    if (this.personDetails.personRoleId === 'null' || !this.personDetails.personRoleId) {
      this.map.set('personrole', 'Please provide a role.');
    } else {
      this.personDetails.proposalPersonRole = this.personnelLookupData.proposalPersonRoles
        .find(person => person.id === parseInt(this.personDetails.personRoleId, 10));
      this.personDetails.isPi = this.personDetails.proposalPersonRole.id === 3 ? true : false;
      if (!this.personDetails.isPi) {
        this.clearLeadUnitFlag();
      }
    }
    if (this.personDetails.isPi && !this.personDetails.awardPersonUnits.find(unit => unit.leadUnitFlag === true)) {
      this.unitSearchOptions.errorMessage = 'Please add one Lead Unit for adding Principal Investigator.';
      // dummy map to trigger validation.
      this.map.set('dept', 'Please add one Lead Unit for adding Principal Investigator');
    }
  }

  /**isDuplicateEmployee - Function to check if currently added person under employee is already added
   *  and returns true if match found
   */
  isDuplicateEmployee(PERSON) {
    return (this.isEmployeeFlag && PERSON.personId === this.personDetails.personId) ? true : false;
  }

  /**isDuplicateNonEmployee - Function to check if currently added person under non-employee is already added
  *  and returns true if match found
  */
  isDuplicateNonEmployee(PERSON) {
    return (!this.isEmployeeFlag && PERSON.rolodexId === this.personDetails.rolodexId) ? true : false;
  }

  /**isDuplicatePerson - validation for duplicate person when adding and editing keypersonnal
   * @param {} PERSON
   */
  isDuplicatePerson(PERSON) {
    if (this.isDuplicateEmployee(PERSON) || this.isDuplicateNonEmployee(PERSON)) {
      if (!PERSON.awardPersonId || (PERSON.awardPersonId !== this.personDetails.awardPersonId)) {
        this.keyPersonElasticOptions.errorMessage = 'You have already added ' + this.personDetails.fullName + '.';
        this.clearField = new String('false');
        this.map.set('personfullname', 'fullname');
        this.isPersonCard = false;
      }
    }
  }

  /**isDuplicatePI - validation for duplicate Principal Investigator when adding and editing keypersonnal
   * @param {} PERSON
   */
  isDuplicatePI(PERSON) {
    if (PERSON.isPi && this.personDetails.isPi) {
      if (!PERSON.awardPersonId || (PERSON.awardPersonId !== this.personDetails.awardPersonId)) {
        this.map.set('personrole', 'You have already added a Principal Investigator.');
        this.isPersonCard = false;
      }
    }
  }

  /**clearPersonDetails - clears person's Id, and choosed departments if person is cleared or not valid */
  clearPersonDetails() {
    delete this.personDetails['personId'];
    delete this.personDetails['rolodexId'];
    this.map.delete('personfullname');
    this.keyPersonElasticOptions.errorMessage = this.unitSearchOptions.errorMessage = null;
  }

  /**clearLeadUnitFlag - method set all leadUnitFlag of units to false*/
  clearLeadUnitFlag() {
    this.personDetails.awardPersonUnits.map(unit => unit.leadUnitFlag = false);
  }

  /**setLeadUnitFlag - sets all leadUnitFlag values to false and set leadUnitFlag of selected unit to true
   * @param unitIndex
   */
  setLeadUnitFlag(unitIndex) {
    this.clearLeadUnitFlag();
    this.personDetails.awardPersonUnits[unitIndex].leadUnitFlag = true;
    this.$unitList.next();
  }

  /**validateAndSetData - This function deals validates and sets required data for saving key person
   */
  validateAndSetData(type) {
    this.isPersonCard = false;
    if (this.keyPersonValidation()) {
      this.setCommonAwardData();
      this.checkIfCVExist(type);
    }
  }

  /**checkIfCVExist - method checks if there are attachments and calls respective functions
   */
  checkIfCVExist(type) {
    this.personDetails.awardPersonAttachment ? this.addPersonAttachment(type) : this.saveKeyPerson(type);
  }

  /**addPersonAttachment - Adds(if Key Person add) or Updates(if Key Person edit) CV
   * if Key person update and alreday existing CV was deleted CV object will be updated as null
   */
  addPersonAttachment(type) {
    if (this.isKeyPersonEdit && this.replaceAttachmentId) {
      if (this.personDetails.awardPersonAttachment.length === 0) {
        this.setCVObject(null);
      }
      this.personDetails.awardPersonAttachment[0].replaceAttachmentId = this.replaceAttachmentId;
    }
    if (this.personDetails.awardPersonAttachment.length > 0 && !this.personDetails.awardPersonAttachment[0].attachmentId) {
      if (!this._commonService.isWafEnabled) {
        this.$subscriptions.push(this._keyPersonService.addAwardPersonAttachment(
          this.personDetails.awardPersonAttachment, this.uploadedFile)
          .subscribe((data: any) => {
            this.personDetails.awardPersonAttachment = data.newPersonAttachments;
            this.saveKeyPerson(type);
          }, err => {
            this._commonService.showToast(HTTP_ERROR_STATUS,"Adding CV failed. please try again.")
          }));
      } else {
        this.addPersonAttachmentWaf(type);
      }
    } else {
      this.saveKeyPerson(type);
    }
  }
  /**
    * @param  {} type
    * if cv is attached ,sets parameters and calls saveAttachment function in wafAttachment service.
    * Otherwise calls saveWafRequest function in wafAttachment service.
    */
  async addPersonAttachmentWaf(type) {
    const requestForWaf: any = {
      awardId: this.awardData.awardId,
      userFullName: this._commonService.getCurrentUserDetail('fullName'),
      personId: this._commonService.getCurrentUserDetail('personID')
    };
    if (this.uploadedFile.length > 0) {
      const requestsetAtRemaining = {
        newPersonAttachments: this.personDetails.awardPersonAttachment
      };
      const data = await this._wafAttachmentService.saveAttachment(requestForWaf, requestsetAtRemaining, this.uploadedFile,
        '/addAwardPersonAttachmentForWaf', null, null);
      this.checkAttachmentSaved(data, type);
    } else {
      requestForWaf.newPersonAttachments = this.personDetails.awardPersonAttachment;
      this._wafAttachmentService.saveWafRequest(requestForWaf, '/addAwardPersonAttachmentForWaf').then(data => {
        this.checkAttachmentSaved(data, type);
      }).catch(error => {
        this.checkAttachmentSaved(error, type);
      });
    }
  }
  /**
   * @param  {} data
   * @param  {} type
   * if data doesn't contains error, add attachment details to person details and calls savekeyperson function.
   * Otherwise shows error toast.
   */
  checkAttachmentSaved(data, type) {
    if (data && !data.error) {
      this.personDetails.awardPersonAttachment = data.newPersonAttachments;
      this.saveKeyPerson(type);
    } else {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Waf blocked adding CV.');
    }
  }
  /**saveKeyPerson - Add or Update person details to the database
   */
  saveKeyPerson(type) {
    if (!this.isSaving) {
    this.personDetails.awardId = this.awardData.awardId;
    this.isSaving = true;
    this.$subscriptions.push(this._keyPersonService.maintainKeyPersonnel(this.personDetails, type).subscribe((data: any) => {
      this.result.awardPersons = data.awardPersons;
      this.result.award.principalInvestigator = data.awardPIPerson;
      this.result.award.piPersonId = data.awardPIPersonId;
      this.result.award.leadUnit.unitName = data.leadUnitName;
      this.result.award.leadUnit.unitNumber = data.leadUnitNumber;
      this.result.award.leadUnitNumber = data.leadUnitNumber;
      this.updateAwardStoreData();
    }, err => {
      this._commonService.showToast(HTTP_ERROR_STATUS, (this.isKeyPersonEdit) ?
      (`Updating ${KEY_PERSON_LABEL.toLowerCase()}  failed. Please try again.`) : (`Adding ${KEY_PERSON_LABEL.toLowerCase()} failed. Please try again.`));
      this.isSaving = false;
    },
      () => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, (this.isKeyPersonEdit) ?
          (`${KEY_PERSON_LABEL} updated successfully.`) : (`${KEY_PERSON_LABEL} added successfully.`));
        this.resetPersonFields();
        this.isSaving = false;
        $('#add-key-person-modal').modal('hide');
      }));
    }
  }

  /**cvDrop - to choose cv in modal
  */
  cvDrop(files) {
    /**  files.length > 0 is checked for solving issue of adding cv in IE, This function is called twice in IE.
        The second call returns an empty file array, which caused the issue */
    if (files.length > 0) {
      this.uploadedFile = [];
      this.uploadedFile.push(files[0]);
    }
  }

  deleteCV(deleteAwardCV) {
    deleteAwardCV.splice(0, 1);
  }

  clearCVData() {
    this.uploadedFile = [];
  }

  addCV() {
    if (this.uploadedFile.length !== 0) {
      this.setCVObject(this.uploadedFile);
    }
  }

  setCVObject(files) {
    this.personDetails.awardPersonAttachment = [];
    const tempOjectForAdd: any = {};
    tempOjectForAdd.fileName = files ? files[0].name : null;
    tempOjectForAdd.mimeType = files ? files[0].type : null;
    tempOjectForAdd.description = null;
    this.personDetails.awardPersonAttachment.push(tempOjectForAdd);
  }

  downloadAwardPersonCV(attachment) {
    this.$subscriptions.push(this._keyPersonService.downloadAwardPersonAttachment(attachment.attachmentId)
      .subscribe(data => {
        fileDownloader(data, attachment.fileName);
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

  resetPersonFields() {
    this.personDetails = {};
    this.personDetails.awardPersonUnits = [];
    this.$unitList.next();
    this.personDetails.personRoleId = null;
    this.uploadedFile = [];
    this.isEmployeeFlag = true;
    this.setElasticPersonOption();
    this.setCommonAwardData();
    this.keyPersonElasticOptions.defaultValue = '';
    this.clearField = new String('true');
    this.map.clear();
    this.isKeyPersonEdit = false;
    this.unitSearchOptions.errorMessage = null;
  }

  /**To fetch basic award details that are required for identifing which award is currently on.
  */
  setCommonAwardData() {
    this.personDetails.updateUser = this._commonService.getCurrentUserDetail('userName');
    this.$subscriptions.push(this._commonData.awardData.subscribe((data: any) => {
      if (data) {
        this.awardData = data.award;
        if (this.awardData.awardId) {
          this.personDetails.awardId = this.awardData.awardId;
          this.personDetails.awardNumber = this.awardData.awardNumber;
          this.personDetails.sequenceNumber = this.awardData.sequenceNumber;
        }
      }
    }));
  }

  async getPermissions() {
    this.isMaintainPerson = await this._commonService.checkPermissionAllowed('MAINTAIN_PERSON');
    this.isMaintainRolodex = await this._commonService.checkPermissionAllowed('MAINTAIN_ROLODEX');
  }

  /**fetchKeyPersonDetails - To fetch employee details or non-employee details on the basis of personId or rolodexId in 'person'
  * @param  {} person
  */
  fetchKeyPersonDetails(person) {
    this.isRolodexViewModal = true;
    this.personDescription = person.proposalPersonRole.description;
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

  checkPersonViewPermission(person) {
    if (person.personId) {
      this.isEnableViewMore = this.isMaintainPerson ||
      this.personDetails.personId === this._commonService.getCurrentUserDetail('personID') ;
    } else {
      this.isEnableViewMore = this.isMaintainRolodex;
    }
  }

  updateSelectedPersonDetails(selectedPersonDetails, person) {
    this.selectedPersonDetails = selectedPersonDetails;
    this.selectedPersonDetails.proposalPersonRole = person.proposalPersonRole;
  }

  /*viewPersonDetails - Function navigates to desired page to view details of a person */
  viewPersonDetails() {
    const a = document.createElement('a');
    this.selectedPersonDetails.hasOwnProperty('personId') ?
      a.href = '#/fibi/person/person-details?personId=' + this.selectedPersonDetails.personId :
      a.href = '#/fibi/rolodex?rolodexId=' + this.selectedPersonDetails.rolodexId;
    a.target = '_blank';
    a.click();
    a.remove();
  }

  setPersonRole() {
    this.personDetails.proposalPersonRole = this.personDetails.personRoleId ? this.getPersonRole() : null;
    this.clearProjectRole();
  }

  private clearProjectRole() {
    if (this.personDetails.proposalPersonRole && !this.personDetails.proposalPersonRole.showProjectRole) {
      this.personDetails.projectRole = null;
    }
  }

  getPersonRole() {
    return this.proposalPersonRole.find((role) => role.id == this.personDetails.personRoleId);
  }

  setShowElasticResults(elasticResultShow) {
    this.isPersonCard = elasticResultShow.isShowElasticResults;
  }

  showDeleteModal(){
    $('#add-key-person-modal').modal('hide');
    $('#deleteAwardCvAttachment').modal('show');
  }
  hideCvDeleteConfirmation(){
    $('#add-key-person-modal').modal('show');
    $('#deleteAwardCvAttachment').modal('hide');
  }

  switchToNonEmployeeModal(){
      $('#add-key-person-modal').modal('hide');
      this.isAddNonEmployeeModal = true;
  }

}
