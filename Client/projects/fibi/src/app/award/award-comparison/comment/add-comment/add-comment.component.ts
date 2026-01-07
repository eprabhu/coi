/**
 * Author: ARAVIND P S
 * Component for both Adding and Editing comments.
 * For create :=> sectionCode,awardId, awardNumber & sequenceNumber needed.
 * For edit :=> isEditmode = true, comment => whole comment object
 */
import { Component, OnInit, Input, EventEmitter, Output, OnChanges, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommentsService } from '../comments.service';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../../app-constants';
import { CommonService } from '../../../../common/services/common.service';
import { CommonDataService } from '../../../services/common-data.service';
import { ToolkitEventInteractionService } from '../../toolkit-event-interaction.service';
declare var $: any;

@Component({
  selector: 'app-add-comment',
  templateUrl: './add-comment.component.html',
  styleUrls: ['./add-comment.component.css']
})
export class AddCommentComponent implements OnInit, OnDestroy {

  @Input() awardId: '';
  @Input() awardNumber: '';
  @Input() sequenceNumber: null;
  @Input() sectionCode: '';
  @Input() awardSequenceStatus = '';
  @Input() isEditMode = false; // used only for edit mode
  @Input() comment: any;       // used only for edit mode
  @Output() commentSaved: EventEmitter<any> = new EventEmitter();
  @Output() cancelEdit: EventEmitter<any> = new EventEmitter();
  @Output() editCommentSaved: EventEmitter<any> = new EventEmitter();


  commentObject: any = {
    awardId: '',
    awardNumber: null,
    sequenceNumber: null,
    reviewComment: null,
    reviewSectionCode: null,
    reviewCommentTypeCode: null,
    isPrivateComment: false,
    reviewerPersonId: '',
    updateUser: '',
    isResolved: false
  };
  $subscriptions: Subscription[] = [];
  maintainPrivateComment = false;
  commentMap = new Map();
  isSaving = false;

  constructor(private _commentService: CommentsService, private _CDRef: ChangeDetectorRef,
    private _commonService: CommonService, private _commonData: CommonDataService,
    public _toolKitEvents: ToolkitEventInteractionService) { }

  ngOnInit() {
    if (this.isEditMode) {
      this.commentObject = this.comment;
    }
    this.maintainPrivateComment = this._commonData.checkDepartmentLevelRightsInArray('MAINTAIN_PRIVATE_COMMENTS');
    this.getAwardSequenceStatus();
  }

  ngOnDestroy() {
    this.cancelEvent();
    subscriptionHandler(this.$subscriptions);
  }

  getAwardSequenceStatus() {
    this.$subscriptions.push(this._toolKitEvents.awardSequenceStatus.subscribe((data: string) =>
      this.awardSequenceStatus = this.awardSequenceStatus === '' ? data : this.awardSequenceStatus));
  }

  setAwardDetails() {
    this.commentObject.sequenceNumber = this.sequenceNumber;
    this.commentObject.reviewSectionCode = this.sectionCode;
    this.commentObject.reviewCommentTypeCode = 5;
    this.commentObject.awardId = this.awardId;
    this.commentObject.awardNumber = this.awardNumber;
    this.commentObject.reviewerPersonId = this._commonService.getCurrentUserDetail('personID');
    this.commentObject.updateUser = this._commonService.getCurrentUserDetail('userName');
    this.commentObject.awardSequenceStatus = this.awardSequenceStatus;
  }
  /**
   * for both edit mode and create mode.
   * saving comment functionality.
   * the added/updated data will be emitted to the parent component for updating the comment store
   */
  saveComment() {
    this.setAwardDetails();
    const { replies, ...newResponse } = this.commentObject;
    if (this.validateComment(newResponse.reviewComment) && !this.isSaving) {
      this.isSaving = true;
      this._commentService.saveComment(newResponse).subscribe((data: any) => {
        this._CDRef.markForCheck();
        if (!this.isEditMode) {
          const comment = data.awardReviewComment;
          comment['replies'] = [];
          this.commentSaved.emit(comment);
          this.clearCommentObject();
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Comment added successfully.');
        } else {
          this.commentObject.updateTimeStamp = data.awardReviewComment.updateTimeStamp;
          this.editCommentSaved.emit(this.commentObject);
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Comment updated successfully.');
        }
        this.isSaving = false;
        this.cancelEvent();
      }, err => { this.isSaving = false; 
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Adding Comments failed. Please try again.');
      });
    }
  }
  /**
   * @param  {string} comment
   * return true if the comment has data
   */
  validateComment(comment: string) {
    this.commentMap.clear();
    if (comment) {
      return true;
    } else {
      this.commentMap.set('comment','Please enter comment');
      return false;
    }
  }
  clearCommentObject() {
    this.commentObject = {};
    this.commentObject.isPrivateComment = false;
  }

  /**
   * emits an event when cancel button is clicked.
   */
  cancelEvent() {
    this.cancelEdit.emit(true);
  }
}
