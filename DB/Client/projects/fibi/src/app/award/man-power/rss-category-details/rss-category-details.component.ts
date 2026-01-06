import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { CommonService } from '../../../common/services/common.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { CommonDataService } from '../../services/common-data.service';
import { ManPowerService } from '../man-power.service';
import { HTTP_ERROR_STATUS } from '../../../app-constants';

@Component({
  selector: 'app-rss-category-details',
  templateUrl: './rss-category-details.component.html',
  styleUrls: ['./rss-category-details.component.css']
})
export class RssCategoryDetailsComponent implements OnInit, OnDestroy, OnChanges {

  @Input() manpowerCategory: any;
  @Input() helpText: any;
  @Input() awardData: any;
  @Input() isManpowerEdit: boolean;
  @Input() isShowAllDetails: any = [];
  @Input() componentIndex: string;
  @Input() emitChildResponse: Observable<any>;
  @Output() resourceOperations: EventEmitter<any> = new EventEmitter<any>();
  $subscriptions: Subscription[] = [];
  awardManpowerResources: any = [];
  manpowerResourceDetail: any;

  constructor(private _manpowerService: ManPowerService, public _commonService: CommonService, private _commonData: CommonDataService) { }

  ngOnInit() {
    this.updateUserDetailsFromParent();
  }

  ngOnChanges () {
    if ( this.isShowAllDetails[this.componentIndex.split('-')[1]] === true) {
      this.fetchManpowerResources();
    }
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
  /**
   * add or update resource details. This function emits the data to the main component where the service is called
   */
  addResource(index = null, resource = null) {
    this.resourceOperations.emit({'operationType': 'addResource', 'categoryType': 'Student', 'index': index,
      'addStaffType': null, 'manpowerCategory': this.manpowerCategory, 'resourceObject': resource, 'componentIndex': this.componentIndex});
  }

  updateUserDetailsFromParent() {
    this.$subscriptions.push(this.emitChildResponse.subscribe(data => {
      if (data && data.childComponentIndex === this.componentIndex
        && ['saveOrUpdateResouce'].includes(data.action)) {
          data.index !== null ? this.awardManpowerResources.splice(data.index, 1, data.resource.awardManpowerResource) :
          this.awardManpowerResources.push(data.resource.awardManpowerResource);
          this.manpowerCategory.unCommittedAmount = data.resource.awardManpowerDetail.unCommittedAmount;
          this.manpowerCategory.sapCommittedAmount = data.resource.awardManpowerDetail.sapCommittedAmount;
      }
      if (data && data.childComponentIndex === this.componentIndex
        && ['deleteResource'].includes(data.action) ) {
          this.awardManpowerResources.splice(data.index, 1);
          this.manpowerCategory.unCommittedAmount = data.awardManpowerDetail.unCommittedAmount;
      }
    }));
  }
  /**
   * @param  {} resourceModalData
   * for setting the data for showing the information for the person modal
   */
  showDetailsModal(resourceModalData,isNewHire) {
    this.resourceOperations.emit({'resourceDetails': resourceModalData, 'operationType': 'personDetailsModal',
    'category': 'Student', 'manpowerType': this.manpowerCategory.manpowerType, 'isNewHire': isNewHire});
  }
  /**
   * @param  {} resourceId
   * @param  {} category
   * @param  {} index
   * emit the data to parent component to perform deletion
   */
  deleteResource(resourceId, category, index) {
    this._manpowerService.manpowerCategory = category;
    this.resourceOperations.emit({ 'deleteResourceId': resourceId, 'operationType': 'deleteResource', 'index': index ,'componentIndex':this.componentIndex});
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
        this.manpowerResourceDetail = data;
        this.awardManpowerResources = data.awardManpowerResources ? data.awardManpowerResources : [];
      }, err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in fetching manpower resources');
      }));
  }

}
