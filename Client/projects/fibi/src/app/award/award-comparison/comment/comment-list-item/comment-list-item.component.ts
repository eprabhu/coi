/**
 * Author : Aravind P S
 * All Comments and its reply comment is showed using this component.
 * functionality => edit and update main /parent comment and reply comments.
 * delete both parent and reply comments. => each comment & its reply is sharing the delete modal.
 */
import { Component, OnDestroy, Input, Output, EventEmitter, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommentsService } from '../comments.service';
import { slideInOut } from '../../../../common/utilities/animations';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { HTTP_SUCCESS_STATUS } from '../../../../app-constants';
import { CommonService } from '../../../../common/services/common.service';
import { CommonDataService } from '../../../services/common-data.service';
import { ToolkitEventInteractionService } from '../../toolkit-event-interaction.service';


@Component({
  selector: 'app-comment-list-item',
  templateUrl: './comment-list-item.component.html',
  styleUrls: ['./comment-list-item.component.css'],
  animations: [slideInOut]
})
export class CommentListItemComponent implements OnInit, OnDestroy {

  @Input() sequenceComments: any;
  @Input() isAwardActive = false;
  @Output() commentModified: EventEmitter<any> = new EventEmitter<any>();

  isFolded = true;
  replyCommentId = null;
  editReplyCommentId = [];
  isEditReply = false;
  isEditMainComment = [];
  replyObject: any = {};
  commentObject: any = {};
  removeComment: any = {};
  $subscriptions: Subscription[] = [];
  deleteIndex: any;
  commentMap = new Map();
  personId = this._commonService.getCurrentUserDetail('personID');
  isResolveComment = false;

  constructor(private _commentService: CommentsService, private _CDref: ChangeDetectorRef,
    private _commonService: CommonService, private _commonData: CommonDataService,
    public _toolKitEvents: ToolkitEventInteractionService) { }

  ngOnInit() {
    this.isResolveComment =  this._commonData.checkDepartmentLevelRightsInArray('RESOLVE_COMMENT');
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  resolveComment(comment: any) {
    const REQUEST_OBJECT = {
      'awardReviewCommentId': comment.awardReviewCommentId,
      'personId': this._commonService.getCurrentUserDetail('personID'),
    };
    this._commentService.resolveComment(REQUEST_OBJECT).subscribe((data: any) => {
      comment.isResolved = true;
      comment.resolvedTimeStamp = data.awardReviewComment.resolvedTimeStamp;
      comment.resolvedByFullName = data.awardReviewComment.resolvedByFullName;
      this._CDref.markForCheck();
    });
  }

  setReplyObject(comment: any) {
    this.replyObject.parentReviewCommentId = comment.awardReviewCommentId;
    this.replyObject.sequenceNumber = comment.sequenceNumber;
    this.replyObject.reviewSectionCode = comment.reviewSectionCode;
    this.replyObject.awardId = comment.awardId;
    this.replyObject.awardNumber = comment.awardNumber;
    this.replyObject.reviewCommentTypeCode = 5;
    this.replyObject.reviewerPersonId = this._commonService.getCurrentUserDetail('personID');
    this.replyObject.updateUser = this._commonService.getCurrentUserDetail('userName');
    this.replyObject.isPrivateComment = comment.isPrivateComment;
    this.saveReply(comment);
  }

  /**
   * Handles both adding and update process of reply comments.
   * don't need to emit to parent component since reply's memory is referenced in parent.
   */
  saveReply(comment) {
    if (this.validateComment(this.replyObject.reviewComment)) {
      const { replies, ...newResponse } = this.replyObject;
      this._commentService.saveComment(newResponse).subscribe((data: any) => {
        this._CDref.markForCheck();
        if (this.isEditReply) {
          const index = comment.replies.findIndex(x => x.awardReviewCommentId === data.awardReviewComment.awardReviewCommentId);
          comment.replies[index] = data.awardReviewComment;
          this.isEditReply = false;
          this.editReplyCommentId[data.awardReviewComment.awardReviewCommentId] = null;
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Reply updated successfully.');

        } else {
          comment.replies.unshift(data.awardReviewComment);
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Reply added successfully.');
        }
        this.replyObject = {};
        this.replyCommentId = null;
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
      this.commentMap.set('comment', 'comment');
      return false;
    }
  }

  addReplyToParentComment(commentId, index) {
    this.replyObject = {};
    this.replyCommentId = commentId;
    this.isEditReply = false;
    this.editReplyCommentId.length = 0;
    this.isEditMainComment[index] = false;
  }

  activateEditReplyComment(reply: any, index: any) {
    this.replyCommentId = null;
    this.editReplyCommentId.length = 0;
    this.isEditMainComment[index] = false;
    this.isEditReply = true;
    this.editReplyCommentId[reply.awardReviewCommentId] = reply.awardReviewCommentId;
    this.replyObject = { ...reply };
  }

  activateEditMainComment(comment, index) {
    this.replyCommentId = null;
    this.editReplyCommentId.length = 0;
    this.isEditReply = false;
    this.isEditMainComment = [];
    this.isEditMainComment[index] = true;
    this.commentObject = { ...comment };
  }

  /**
   * handles delete functionality call
   */
  deleteReviewComment(type) {
    this._commentService.deleteComment(this.commentObject.awardReviewCommentId).subscribe((data: any) => {
      this._commonService.showToast(HTTP_SUCCESS_STATUS, data.message);
    });
  }
  /**
   * keeps track of which comment was clicked for delete action.
   * @param type
   * @param id
   */
  updateRemoveComments(type, id, index) {
    this.removeComment.type = type;
    this.removeComment.id = id;
    this.replyCommentId = null;
    this.editReplyCommentId.length = 0;
    this.isEditReply = false;
    this.deleteIndex = index;
    this.isEditMainComment[index] = false;
  }
  /**
   * triggers if delete confirmation modal was clicked yes
   * and deletes the comment which was clicked (removeComment).
   */
  deleteComment(comment) {
    const { type, id } = this.removeComment;
    if (type && id) {
      switch (type) {
        case 'reply':
          const index = comment.replies.findIndex(x => x.awardReviewCommentId === id);
          this.commentObject = { ...comment.replies[index] };
          this.deleteReviewComment(type);
          this.removeComment.type = null;
          this.removeComment.id = null;
          comment.replies.splice(index, 1);
          break;
        case 'parent':
          this.commentObject = { ...comment };
          this.deleteReviewComment(type);
          this.commentModified.emit({ ac: 'D', type: 'parent', comment: this.commentObject });
          this.sequenceComments.splice(this.deleteIndex, 1);
          this.removeComment = {};
          break;
      }
    }
  }
  /**
   * @param  {} data = false
   * @param  {} index
   * closes the edit section on cancel click
   */
  cancelEdit(data = false, index) {
    this.isEditMainComment[index] = false;
  }

  parentEditCommentSave(comment, index) {
    this._CDref.markForCheck();
    this.sequenceComments[index] = comment;
    this.cancelEdit(false, index);
    this.commentModified.emit({ ac: 'E', type: 'parent', comment: comment });
  }
}
