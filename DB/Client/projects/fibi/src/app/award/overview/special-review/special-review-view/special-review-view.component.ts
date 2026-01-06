import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonDataService } from '../../../services/common-data.service';
import { OverviewService } from '../../../overview/overview.service';

@Component({
  selector: 'app-special-review-view',
  templateUrl: './special-review-view.component.html',
  styleUrls: ['./special-review-view.component.css']
})
export class SpecialReviewViewComponent implements OnInit, OnChanges {
  @Input() lookupData: any = {};
  @Input() result: any = {};
  @Input() helpText: any = {};
  isShowCollapse = true;
  isHighlighted: any = false;
  savedSpecialReviewObject: any = {};
  isViewProtocolDetails = false;
  $subscriptions: Subscription[] = [];
  isShowReviewResultCard = false;
  viewSpecialReview: any = {};

  constructor(private _commonData: CommonDataService, private _overviewService: OverviewService) { }

  ngOnInit() {
   }
   ngOnChanges() {
    this.result = this.result;
    this.isHighlighted = this._commonData.checkSectionHightlightPermission('113');
  }
   /**
   * @param  {any} reviewTypeCode
   * get special review type code and returns corresponding type description to the table list
   */
  getReviewType(reviewTypeCode: any) {
    let reviewType: any = {};
    if (this.lookupData.reviewTypes && reviewTypeCode) {
      reviewType = this.lookupData.reviewTypes.find(type => type.specialReviewTypeCode === reviewTypeCode);
      return reviewType.description;
    }
  }

   /**
   * @param  {any} approvalTypeCode
   * get special review approval status code  and returns corresponding approval status  description to the table list
   */
  getApprovalStatus(approvalTypeCode: any) {
    let approvalStatus: any = {};
    if (this.lookupData.approvalStatusTypes && approvalTypeCode) {
      approvalStatus = this.lookupData.approvalStatusTypes.find(status =>
        status.approvalTypeCode === (approvalTypeCode).toString());
      return approvalStatus ? approvalStatus.description : '';
    }
  }
  /**
 * @param savedSpecialReviewObject
 * set type and comment of selected special review. To display in comment modal.
 */
  showSpecialReviewComment(savedSpecialReviewObject) {
    this.savedSpecialReviewObject.comment = savedSpecialReviewObject.comments;
    this.savedSpecialReviewObject.title = this.getReviewType(savedSpecialReviewObject.specialReviewCode);
  }

  viewProtocolDetails(specialReview): void {
    this.viewSpecialReview = specialReview;
    this.isViewProtocolDetails = true;
  }

  closeViewModal(event) {
    this.isViewProtocolDetails = event;
    this.viewSpecialReview = {};
  }
}
