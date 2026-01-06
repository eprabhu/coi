import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { CommonService } from '../../../common/services/common.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { ManPowerService } from '../man-power.service';
import { HTTP_ERROR_STATUS } from '../../../app-constants';

@Component({
  selector: 'app-other-category-details',
  templateUrl: './other-category-details.component.html',
  styleUrls: ['./other-category-details.component.css']
})
export class OtherCategoryDetailsComponent implements OnInit, OnDestroy, OnChanges {

  @Input() manpowerCategory: any;
  @Input() helpText: any;
  @Input() awardData: any;
  @Input() isManpowerEdit: boolean;
  @Input() emitChildResponse: Observable<any>;
  @Input() componentIndex: number;
  @Output() resourceOperations: EventEmitter<any> = new EventEmitter<any>();
  $subscriptions: Subscription[] = [];
  awardManpowerResources: any = [];

  constructor(public _commonService: CommonService, private _manpowerService: ManPowerService) { }

  ngOnInit() {
    this.updateUserDetailsFromParent();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  ngOnChanges() {
    this.fetchManpowerResources();
}
  /**
   * add or update resource details. This function emits the data to the main component where the service is called
   */
  addResource(index = null, resource = null) {
    this.resourceOperations.emit({'operationType': 'addResource', 'categoryType': 'Others', 'index': index,
      'addStaffType': null, 'manpowerCategory': this.manpowerCategory, 'resourceObject': resource, 'componentIndex': this.componentIndex});
  }
  /**
   * @param  {} resourceId
   * @param  {} category
   * @param  {} index
   * emit the data to parent component to perform deletion
   */
  deleteResource(resourceId, category, index) {
    this._manpowerService.manpowerCategory = category;
    this.resourceOperations.emit({ 'deleteResourceId': resourceId, 'operationType': 'deleteResource', 'index': index, 'componentIndex': this.componentIndex});
  }
  updateUserDetailsFromParent() {
    this.$subscriptions.push(this.emitChildResponse.subscribe(data => {
      if (data && data.childComponentIndex === this.componentIndex
        && ['saveOrUpdateResouce'].includes(data.action)) {
          data.index !== null ? this.awardManpowerResources.splice(data.index, 1, data.resource.awardManpowerResource) :
          this.awardManpowerResources.push(data.resource.awardManpowerResource);
      }
      if (data && data.childComponentIndex === this.componentIndex
        && ['deleteResource'].includes(data.action) ) {
          this.awardManpowerResources.splice(data.index, 1);
      }
    }));
  }
  /**
   * @param  {} resourceModalData
   * for setting the data for showing the information for the person modal
   */
  showDetailsModal(resourceModalData, isNewHire) {
    this.resourceOperations.emit({'resourceDetails': resourceModalData, 'operationType': 'personDetailsModal',
    'category': 'Others', 'manpowerType': this.manpowerCategory.manpowerType, 'isNewHire': isNewHire});
  }

  fetchManpowerResources() {
    this.$subscriptions.push(this._manpowerService.fetchManpowerResources(
      {
        awardId: this.manpowerCategory.awardId,
        manpowerTypeCode: this.manpowerCategory.manpowerTypeCode
      })
      .subscribe((data: any) => {
        this.awardManpowerResources = data.awardManpowerResources ? data.awardManpowerResources : [];
      },
       err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in fetching manpower resources');
      }));
  }

}
