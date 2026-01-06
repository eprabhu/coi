/**
 * A subject 'emitChildResponse' is passed as input for the category child component save response from the parent component
 * where the services are called.
 * Every child component observes the above subject and performs a check to verify the specific child component that triggerd
 * the add operation and this verification is done by checking the componentIndex.
 * There is another input passed to the components which is componentIndex which has prefix 'staff-' for staff categories,
 * 'student-' for student category and 'other-' for other category. This is used for catching the response only for the child
 * component from which the add operation was performed.
 */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../app-constants';
import { CommonService } from '../../common/services/common.service';
import { convertToValidAmount, inputRestrictionForAmountField } from '../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { CommonDataService } from '../services/common-data.service';
import { ManPowerService } from './man-power.service';
import { validateApproverHeadCount } from './manpower-utilities';
import { slideInOut } from '../../common/utilities/animations';


declare var $: any;
@Component({
  selector: 'app-man-power',
  templateUrl: './man-power.component.html',
  styleUrls: ['./man-power.component.css'],
  animations: [slideInOut]
})
export class ManPowerComponent implements OnInit, OnDestroy {

  manpowerList: any;
  awardData: any = {};
  $subscriptions: Subscription[] = [];
  manpowerLookups: any;
  canViewStaff = false;
  canViewStudent = false;
  isOthersEdit = false;
  warningArray: any = [];
  deleteResourceObject: any = {};
  fetchPayrollDetails: any = {};
  isStaffEdit = false;
  isStudentEdit = false;
  canViewOthers = false;
  resourceDetails: any;
  emitChildResponse = new Subject();
  childComponentIndex: string;
  resourceModalDetails: any;
  isShowNoData = false;
  addResourceDetails: any;
  helpText: any = {};
  isExpandedStaffView: any = [];
  isExpandedStudentView: any = [];
  isExpandAllStaff = false;
  isExpandAllStudents = false;
  editActualCommitted: any = {};
  committedMap = new Map();
  editActualCommittedData: any = {};
  cutOffDateValidation: any;
  editAdjusted: number;

  constructor(public _commonData: CommonDataService, public _manpowerService: ManPowerService,
    public _commonService: CommonService) { }

  ngOnInit() {
    this.getAwardData();
    this.getManpowerLookups();
    this.fetchManpowerDetails();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
  /**
   * 'MANPOWER_VIEW_STAFF_PLAN' - users can see the EOM category
   * 'MANPOWER_VIEW_STUDENT_PLAN' - users can see the RSS category
   * Section Codes: 131 - Manpower Staff, 134 - Manpower Students, 132 - Manpower Others
   */
  getPermissions() {
    this.canViewStaff = this._commonData.checkDepartmentLevelRightsInArray('MANPOWER_VIEW_STAFF_PLAN') ||
    this._commonData.checkDepartmentLevelRightsInArray('MANPOWER_MAINTAIN_STAFF');
    this.canViewStudent = this._commonData.checkDepartmentLevelRightsInArray('MANPOWER_VIEW_STUDENT_PLAN') ||
    this._commonData.checkDepartmentLevelRightsInArray('MANPOWER_MAINTAIN_STUDENT');
    this.canViewOthers = this._commonData.checkDepartmentLevelRightsInArray('MANPOWER_VIEW_OTHERS_PLAN') ||
    this._commonData.checkDepartmentLevelRightsInArray('MANPOWER_MAINTAIN_OTHERS');
    this.isStaffEdit = this._commonData.getSectionEditableFlag('131') &&
      this._commonData.checkDepartmentLevelRightsInArray('MANPOWER_MAINTAIN_STAFF');
    this.isStudentEdit = this._commonData.getSectionEditableFlag('134') &&
      this._commonData.checkDepartmentLevelRightsInArray('MANPOWER_MAINTAIN_STUDENT');
    this.isOthersEdit = this._commonData.getSectionEditableFlag('132') &&
    this._commonData.checkDepartmentLevelRightsInArray('MANPOWER_MAINTAIN_OTHERS');
  }
  /**
   * users with 'MAINTAIN_MANPOWER' right can create manpower and add resource to the list
   */
  getAwardData() {
    this.$subscriptions.push(this._commonData.awardData.subscribe((data: any) => {
      if (data) {
        this.awardData = data;
        this.getPermissions();
        this.fetchHelpText();
      }
    }));
  }

  fetchManpowerDetails() {
    this._commonService.isManualLoaderOn = true;
    this.$subscriptions.push(this._manpowerService.fetchManpowerDetails({
      'awardId': this.awardData.award.awardId,
      'awardNumber': this.awardData.award.awardNumber,
      'sequenceNumber': this.awardData.award.sequenceNumber,
      'awardSequenceStatus' : this.awardData.award.awardSequenceStatus,
      'isCreateManpower': false,
      'updateUser': this._commonService.getCurrentUserDetail('userName')
    }).subscribe((data: any) => {
      if (data) {
        this.manpowerList = data.manpowerCategory.awardManpowerDetails;
        this.checkForResourceWarnings();
        this.isShowNoData = this.checkIfDataPresent();
        if (this.manpowerList.Staff) {this.manpowerList.Staff.forEach(ele => {this.isExpandedStaffView.push(false); }); }
        if (this.manpowerList.Student) {this.manpowerList.Student.forEach(ele => {this.isExpandedStudentView.push(false); }); }
      }
      this._commonService.isManualLoaderOn = false;
    }));
  }
  /**
   * for fetching all the manpower lookups and check if the manpower is created for that award.
   * If a manpower is created then calls the service to fetch the manpower
   */
  getManpowerLookups() {
    this.$subscriptions.push(this._manpowerService.fetchAllManpowerLookUpDatas(this.awardData.award.awardId).subscribe((data: any) => {
      if (data) {
        this.manpowerLookups = data;
      }
    }));
  }

  /**
   * Fetches help text for Award Section Codes 131 - Manpowers
   */
  fetchHelpText() {
    this.$subscriptions.push(this._manpowerService.fetchHelpText({
      'moduleCode': 1, 'sectionCodes': [131]
    }).subscribe((data: any) => {
      this.helpText = this.setHelpTextForLineItems(data);
    }));
  }
  /**
  * @param helpTextObj
  * This function is used to remove array of the list of line items that comes on response.
  * This is because to remove index and convert to objects
  * so that you can easily display the help text using [] notation as used in html.
  */
  setHelpTextForLineItems(helpTextObj: any = {}) {
    helpTextObj.manpower.parentHelpTexts.forEach(lineItem => {
      const objectKey = Object.keys(lineItem);
      helpTextObj.manpower[objectKey[0]] = lineItem[objectKey[0]];
    });
    return helpTextObj;
  }
  /**
   * @param  {} event
   * to trigger different operations on resource list
   */
  invokeOperation(event) {
    switch (event.operationType) {
      case 'deleteResource' : this.deleteResource(event); break;
      case 'payrollModal' : this.fetchManpowerPayrollDetails(event); break;
      case 'addResource' : this.addResource(event); break;
      case 'personDetailsModal' : this.openPersonDetailsModal(event); break;
      case 'editActualCommitted' : this.editActualCommittedAmount(event); break;
      }
  }

  editActualCommittedAmount(event) {
    this.committedMap.clear();
    this.editActualCommittedData = event;
    this.editActualCommitted = JSON.parse(JSON.stringify(event.resource));
    $('#edit-adjusted-committed-amount').modal('show');
  }

  overrideActualCommittedAmount() {
    this.validateAmount();
    if (!this.committedMap.size) {
      this.$subscriptions.push(this._manpowerService.overrideActualCommittedAmount({
        'manpowerWorkdayResourceId': this.editActualCommitted.manpowerWorkdayResourceId,
        'adjustedCommittedCost': convertToValidAmount(this.editActualCommitted.adjustedCommittedCost),
        'wbsNumber': this.editActualCommittedData.category.budgetReferenceNumber,
        'awardId': this.awardData.awardId
      }).subscribe((data: any) => {
        $('#edit-adjusted-committed-amount').modal('hide');
        this.editActualCommittedData.resource.adjustedCommittedCost = data.adjustedCommittedCost;
        this.editActualCommittedData.category.unCommittedAmount = data.unCommittedAmount;
        this.editActualCommittedData.category.sapCommittedAmount = data.sapCommittedAmount;
        this.editActualCommittedData.action = 'editActualCommitted';
        this.emitChildResponse.next(this.editActualCommittedData);
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Successfully updated adjusted committed amount.');
      }, err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in updating adjusted committed amount failed. Please try again.');
      }));
    }
  }

  addResource(event) {
    this.addResourceDetails = event;
  }

  addResourceResponse(event) {
    event.action = 'saveOrUpdateResouce';
    this.manpowerLookups.positionValidation = event.positionValidation;
    this.emitChildResponse.next(event);
    this.addResourceDetails = null;
    this.checkForResourceWarnings();
  }

  deleteResource(event) {
    $('#delete-manpower-resource').modal('show');
    this.deleteResourceObject = event;
  }

  deleteManpowerResource() {
    this.$subscriptions.push(this._manpowerService.deleteManpowerResource({
      'manpowerResourceId': this.deleteResourceObject.deleteResourceId,
      'awardManpowerId': this._manpowerService.manpowerCategory.awardManpowerId,
      'updateUser': this._commonService.getCurrentUserDetail('userName')
    }).subscribe((data: any) => {
      this._manpowerService.manpowerCategory.awardManpowerResource.splice(this.deleteResourceObject.index, 1);
      this._manpowerService.manpowerCategory.sapCommittedAmount = data.awardManpowerDetail.sapCommittedAmount;
      this._manpowerService.manpowerCategory.actualHeadCount = data.awardManpowerDetail.actualHeadCount;
      this._manpowerService.manpowerCategory = {};
      data.childComponentIndex = this.deleteResourceObject.componentIndex;
      data.action = 'deleteResource';
      data.index = this.deleteResourceObject.index;
      this.manpowerLookups.positionValidation = data.positionValidation;
      this.emitChildResponse.next(data);
      this.deleteResourceObject = {};
      this.checkForResourceWarnings();
    }, err => {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Deleting resources failed. Please try again.');
    }, () => {
      this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Resource successfully deleted.');
    }));
  }

  fetchManpowerPayrollDetails(details) {
    this.$subscriptions.push(this._manpowerService.fetchManpowerPayrollDetails({
      'employeeNumber': details.personId, 'internalOrderCode': details.ioCode
    }).subscribe((data: any) => {
      this.fetchPayrollDetails = data;
      this.fetchPayrollDetails.fullName = details.name;
      $('#manpower-resource-pay-details-modal').modal('show');
    }));
  }
  /**
   * @param  {} personDetails
   * For opening the resource more details modal
   */
  openPersonDetailsModal(personDetails: any) {
    this.resourceModalDetails = personDetails;
    $('#manpower-person-more-details-modal').modal('show');
  }
  /**
   * checks if any resource from student or staff are in cut-off date when system date is same as cut-off date
   */
  checkForResourceWarnings() {
    this.warningArray = [];
    if (this.awardData.award.awardWorkflowStatus.workflowAwardStatusCode !== '3' && this.manpowerList.Staff) {
      if (this.checkCategoryHeadcount(this.manpowerList.Staff).length) {
        this.warningArray.push('Exceed headcount please ensure there is no overlap unless approved by the funder.');
      }
    }
  }

  /**
   * @param  {any=[]} list
   */
  checkCategoryHeadcount(list: any = []) {
    const returnArray: any = [];
    list.forEach(element => {
      if (element.approvedHeadCount < element.actualHeadCount ||
        validateApproverHeadCount(element.approvedHeadCount, element.awardManpowerResource, true)) {
        returnArray.push(true);
      }
    });
    return returnArray;
  }
  /**
   * To check the manpower is present or not
   * checks if manpowerList is there is not then returns true and shows the no data container
   * but if manpowerList is there but the user doesn't have any rights then also shows the no data container
   */
  checkIfDataPresent(): boolean {
    return !this.manpowerList ||
    ((this.manpowerList.Staff && !(this.canViewStaff || this.isStaffEdit)) ||
    (this.manpowerList.Student && !(this.canViewStudent || this.isStudentEdit)) ||
    (this.manpowerList.Others && !(this.canViewOthers || this.isOthersEdit)));
  }
  /**
   * @param  {string} conditionArray : conditional array
   * @param  {boolean} condition
   * @param  {any=[]} valueArray : array of categories..staff or students
   * for checking expanding or collapsing all the category elements
   */
  toggleCategories(conditionArray: string, condition: boolean) {
    this[conditionArray] = this[conditionArray].map(item => item = condition);
  }
  /**
   * @param  {any=[]} array
   * @param  {string} valueOfMainArray
   * for checking the condition to show collapse button or expand button
   */
  checkConditionArray(array: any = [], valueOfMainArray: string) {
    return array.length && array.length === this.manpowerList[valueOfMainArray].length ? array.every(ele => ele === true) : false;
  }

  validateAmount() {
    this.committedMap.delete('committedCost');
    if (this.editActualCommitted.adjustedCommittedCost === null) {
      this.committedMap.set('committedCost', 'Committed amount cannot be null');
    }
    if (inputRestrictionForAmountField(this.editActualCommitted.adjustedCommittedCost)) {
      this.committedMap.set('committedCost', inputRestrictionForAmountField(this.editActualCommitted.adjustedCommittedCost));
    }
    if (this.editActualCommitted.adjustedCommittedCost > this.editActualCommittedData.category.budgetAmount) {
      this.committedMap.set('committedCost', 'Committed amount cannot be greater than budget amount');
    }
  }

}
