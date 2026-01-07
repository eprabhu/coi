/**
 * Author: Aravind P S
 * Hanldes section based CRUD comments.
 * requires only section code, rest of the data will be fetched from review and toolkit interaction services.
 */
import { Component, OnInit, Input, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { slideInOut } from '../../../../common/utilities/animations';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { Subscription } from 'rxjs';
import { ToolkitEventInteractionService } from '../../toolkit-event-interaction.service';
import { CommonDataService } from '../../../services/common-data.service';


@Component({
  selector: 'app-comment-box',
  templateUrl: './comment-box.component.html',
  styleUrls: ['./comment-box.component.css'],
  animations: [slideInOut],
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class CommentBoxComponent implements OnInit, OnDestroy {

  @Input() sectionCode: any;
  @Input() awardId: '';
  @Input() awardNumber: '';
  @Input() sequenceNumber: null;
  @Input() awardSequenceStatus = '';
  isFolded = true;
  $subscriptions: Subscription[] = [];
  awardReviewComments: any = [];
  isAddReviewComment = false;
  isAwardActive = false;
  commentsList: any = {};

  constructor(private _CDRef: ChangeDetectorRef, private _commonData: CommonDataService,
    public _toolKitEvents: ToolkitEventInteractionService) { }

  ngOnInit() {
    this.getCommentList();
    this.isAddReviewComment = this._commonData.checkDepartmentLevelRightsInArray('REVIEW_COMMENTS_RIGHT');
    this.checkActiveVersion();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  /**
   * subscribe the entire comment list and filtering the comments w.r.t section code
   */
  getCommentList() {
    this.$subscriptions.push(this._toolKitEvents.$versionCommentList.subscribe(data => {
      if (data) {
        this.awardReviewComments = this._toolKitEvents.getSequenceCommentsForSection(this.sectionCode, data);
        this.commentsList = data;
        this._CDRef.markForCheck();
      }
    }));
  }

  checkActiveVersion() {
    this.$subscriptions.push(this._toolKitEvents.$currentHeader.subscribe((data: any) => {
      if (Object.keys(data).length) {
        this.isAwardActive = data.leftVersion.isAwardActive;
      }
    }));
  }

  /**
   * Adding comments to the list which are emitted by the child component
   * @param data
   */
  sectionCommentSaved(data) {
    if (data) {
      this.awardReviewComments.unshift(data);
      this.commentsList.unshift(data);
      this._toolKitEvents.groupBySection(this.commentsList);
    }
  }

  findIndexOfParentComment(commentId) {
    if (commentId) {
      return this.commentsList.findIndex(x => x.awardReviewCommentId === commentId);
    }
    return -1;
  }

  removeParentCommentFromAllComments(parentCommentId) {
    const index = this.findIndexOfParentComment(parentCommentId);
    this.commentsList.splice(index, 1);
    this._toolKitEvents.groupBySection(this.commentsList); // This will update the comments count of tool kit
  }

  refreshCommentCounts(data) {
    const { ac, type, comment } = data;
    if (ac === 'D') { // delete
      if (type === 'parent') {
          this.removeParentCommentFromAllComments(comment.awardReviewCommentId);
        }
    }
  }
}
