import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { CommonService } from '../../../common/services/common.service';
import { setFocusToElement } from '../../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { CommonDataService } from '../../services/common-data.service';
import { ManPowerService } from '../man-power.service';
import { compareSequenceNumber } from '../manpower-utilities';
import { HTTP_ERROR_STATUS } from '../../../app-constants';
import { slideInOut } from '../../../common/utilities/animations';

declare var $: any;
@Component({
  selector: 'app-eom-category-detail',
  templateUrl: './eom-category-detail.component.html',
  styleUrls: ['./eom-category-detail.component.css'],
  animations: [slideInOut]
})
export class EomCategoryDetailComponent implements OnInit, OnDestroy, OnChanges {

  @Input() manpowerCategory: any;
  @Input() helpText: any;
  @Input() awardData: any;
  @Input() isManpowerEdit: boolean;
  @Input() isShowAllDetails: any = [];
  @Input() emitChildResponse: Observable<any>;
  @Input() componentIndex: string;
  @Output() resourceOperations: EventEmitter<any> = new EventEmitter<any>();
  setFocusToElement = setFocusToElement;
  $subscriptions: Subscription[] = [];
  canViewPayrollDetails = false;
  compareSequenceNumber = compareSequenceNumber;
  canEditCommittedAmount = false;
  awardManpowerResources: any = [];
  workdayResourceData: any = [];
  isManpowerAdminCorrection: any;
  positionValidation: String;

  constructor(private _manpowerService: ManPowerService, private _commonData: CommonDataService, public _commonService: CommonService) { }

  ngOnInit() {
    this.updateUserDetailsFromParent();
  }

  ngOnChanges() {
    this.getPermissions();
    if ( this.isShowAllDetails[this.componentIndex.split('-')[1]] === true) {
      this.fetchManpowerResources();
    }
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  getPermissions() {
    this.canViewPayrollDetails = this._commonData.checkDepartmentLevelRightsInArray('MANPOWER_VIEW_STAFF_PAYROLL');
    this.canEditCommittedAmount = this._commonData.getSectionEditableFlag('133') &&
      this._commonData.checkDepartmentLevelRightsInArray('MANPOWER_MODIFY_STAFF_COMMITTED_AMOUNT');
    this.isManpowerAdminCorrection = this._commonData.getSectionEditableFlag('136');
  }

  /**
   * add or update resource details. This function emits the data to the main component where the service is called
   */
  addResource(index = null, type: string, resource = null) {
    this.resourceOperations.emit({
      'operationType': 'addResource', 'categoryType': 'Staff', 'index': index,
      'addStaffType': type ? type : resource.personId ? 'Existing' : 'New',
      'componentIndex': this.componentIndex, 'manpowerCategory': this.manpowerCategory, 'resourceObject': resource,
      'awardManpowerResources': this.awardManpowerResources ? this.awardManpowerResources : []
    });
  }
  /**
   * @param  {} code
   * for setting the badge colour
   * 1 -	Position Not Triggered
   * 2 -	Ready To Trigger Position
   * 3 -	Position Triggering
   * 4 -	Active
   * 5 -	Ended
   */
  getPositionStatusClass(code) {
    if (code === '9') {
      return 'warning';
    } else if (code === '4') {
      return 'success';
    } else if (code === '5' || code === '8' || code === '11') {
      return 'danger';
    } else {
      return 'info';
    }
  }

  getJobRequisitionStatusClass(status) {
    if (status === 'Open') {
      return 'info';
    } else if (status === 'Filled') {
      return 'success';
    } else if (status === 'Frozen') {
      return 'warning';
    } else if (status === 'Closed') {
      return 'danger';
    } else {
      return 'dark';
    }

  }
  /**
   * @param  {} resourceModalData
   * for setting the data for showing the information for the person modal
   */
  showDetailsModal(resourceModalData, isNewHire) {
    this.resourceOperations.emit({
      'resourceDetails': resourceModalData, 'operationType': 'personDetailsModal',
      'category': 'Staff', 'manpowerType': this.manpowerCategory.manpowerType, 'isNewHire': isNewHire
    });
  }
  /**
   * @param  {} resourceId
   * @param  {} category
   * @param  {} index
   * emit the data to parent component to perform deletion
   */
  deleteResource(resourceId, category, index) {
    this._manpowerService.manpowerCategory = category;
    this.resourceOperations.emit({
      'deleteResourceId': resourceId, 'operationType': 'deleteResource',
      'index': index, 'componentIndex': this.componentIndex, 'awardManpowerId': this.manpowerCategory.awardManpowerId
    });
  }
  /**
   * @param  {string} personId
   * @param  {string} ioCode
   * @param  {string} name
   * emit the data to parent component to trigger the payroll modal
   */
  payrollModal(personId: string, ioCode: string, name: string) {
    this.resourceOperations.emit({ 'personId': personId, 'ioCode': ioCode, 'operationType': 'payrollModal', 'name': name });
  }

  updateUserDetailsFromParent() {
    this.$subscriptions.push(this.emitChildResponse.subscribe(data => {
      if (data && data.childComponentIndex === this.componentIndex
        && ['saveOrUpdateResouce'].includes(data.action)) {
          data.index !== null ? this.awardManpowerResources.splice(data.index, 1, data.resource) :
          this.awardManpowerResources.push(data.resource);
          this.manpowerCategory.unCommittedAmount = data.awardManpowerDetail.unCommittedAmount;
          this.positionValidation = data.positionValidation;
      }
      if (data && data.childComponentIndex === this.componentIndex
        && ['deleteResource'].includes(data.action) ) {
          this.awardManpowerResources.splice(data.index, 1);
          this.manpowerCategory.unCommittedAmount = data.awardManpowerDetail.unCommittedAmount;
          this.positionValidation = data.positionValidation;
      }
    }));
  }

  editActualCommitted(resource, category, index) {
    this.resourceOperations.emit({ 'resource': resource, 'category': category,
    'operationType': 'editActualCommitted', 'index': index, 'childComponentIndex': this.componentIndex });
  }

  fetchManpowerResources() {
    this.$subscriptions.push(this._manpowerService.fetchManpowerResources(
      {
        awardId: this.manpowerCategory.awardId,
        awardManpowerId : this.manpowerCategory.awardManpowerId,
        manpowerTypeCode: this.manpowerCategory.manpowerTypeCode,
        wbsNumber : this.manpowerCategory.budgetReferenceNumber
      })
      .subscribe((data: any) => {
        this.positionValidation = data.positionValidation;
        if (data.workdayManpowerResourceDetails) {
          this.workdayResourceData = data.workdayManpowerResourceDetails.manpowerWorkdayResourceDetail;
        }
        if (data.awardManpowerResources) {
          this.awardManpowerResources = data.awardManpowerResources;
        }
      },
      err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in fetching manpower resources');
    }));
  }
}
