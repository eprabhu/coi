/**
 * Author: Aravind P S
 * Shows all the comments in an awardId.
 * comments are grouped according to each section
 * Fetch • |-> fetch & subscribe current filter.
 */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommentsService } from './comments.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { slideInOut } from '../../../common/utilities/animations';
import { Section } from '../interfaces';
import { AwardSection } from '../comparison-constants';
import { ToolkitEventInteractionService } from '../toolkit-event-interaction.service';
import { CommonDataService } from '../../services/common-data.service';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css'],
  animations: [slideInOut]
})
export class CommentComponent implements OnInit, OnDestroy {

  showAddComment: any = [];
  comments: any = [];
  filterTypes: any = [];
  filterCommentReviewersList = [];
  commentDetails: any = {};
  sections: Array<Section> = AwardSection;
  $subscriptions: Subscription[] = [];
  sectionComments: any = {};
  commentList: any = [];
  isToolkitVisible = true;
  isAddReviewComment = false;
  isAwardActive = false;

  constructor(private _commentsService: CommentsService, private _commonData: CommonDataService,
     public _toolKitService: ToolkitEventInteractionService) { }

  ngOnInit() {
    this.setAwardDetails();
    this.getToolkitVisibility();
    this.isAddReviewComment =  this._commonData.checkDepartmentLevelRightsInArray('REVIEW_COMMENTS_RIGHT');
    this.checkActiveVersion();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }
  /**
   * get award details for fetching review comments
   * and filter the obtained output
   */
  setAwardDetails() {
    this.$subscriptions.push(this._toolKitService.$viewEvent.subscribe((data: any) => {
      if (data.baseAwardId) {
        this.commentDetails = data;
        this.fetchReviewComments(data.baseAwardId);
        this.fetchFilterData();
      }
    }));
  }

  fetchReviewComments(baseAwardId) {
    this._commentsService.getAllReviewComments(
      { 'awardId': baseAwardId,
      'awardNumber': this.commentDetails.awardNumber
    }).subscribe((data: any) => {
      this.commentList = data.awardReviewComments;
      this._toolKitService.$versionCommentList.next(data.awardReviewComments);
    });
  }

  checkActiveVersion() {
    this.$subscriptions.push(this._toolKitService.$currentHeader.subscribe((data: any) => {
      if (Object.keys(data).length) {
        this.isAwardActive = data.leftVersion.isAwardActive;
      }
    }));
  }

  /**
   * subscribe the entire comment list and grouping the comments w.r.t section code
   */
  getCommentList() {
    this.$subscriptions.push(this._toolKitService.$versionCommentList.subscribe(data => {
      if (data) {
        this.sectionComments = this._toolKitService.groupBySection(data);
      }
    }));
  }

  getToolkitVisibility() {
    this.$subscriptions.push(this._toolKitService.$isToolkitVisible.subscribe(data => {
      this.isToolkitVisible = data;
    }));
  }

  toggleToolkitVisibility() {
    this.isToolkitVisible = !this.isToolkitVisible;
    this._toolKitService.$isToolkitVisible.next(this.isToolkitVisible);
  }
  /**
   * Fetch filter types and filter data w.r.t the types
   */
  fetchFilterData() {
    this.$subscriptions.push(this._toolKitService.$filter.subscribe(data => {
      if (data) {
        this.getCommentList();
        this.filterTypes = data;
        this.checkIfFilterIsActive();
      }
    }));
  }

  /**
  * keep tab of filters that are currently active.
  */
  checkIfFilterIsActive() {
    // don't want filter if original data is empty
    if (this.filterTypes.length > 0 && this.sectionComments && Object.keys(this.sectionComments).length > 0) {
      this.filterComments(this.filterTypes);
    }
  }

  /**
  * filters group comments using all review comments
  *  filterTypes sample data => [
     {commentType: 'public' or 'private'},
     {commentStatus: 'resolved' or 'unresolved'},
     {reviewer: '90001'},
  * @param filterTypes
  */
  filterComments(filterTypes) {
    try {
      const individualFilterType = filterTypes.map(filter => Object.keys(filter));
      if (this._toolKitService.$versionCommentList.getValue()) {
        let typeFilteredProtocolComments = [...this._toolKitService.$versionCommentList.getValue()];
        individualFilterType.forEach((type, i) => {
          const value = filterTypes[i][type];
          if (type[0] === 'commentType' && value) {
            typeFilteredProtocolComments = typeFilteredProtocolComments.filter(x => x.isPublicComment === (value === 'public'));
          }
          if (type[0] === 'commentStatus' && value) {
            typeFilteredProtocolComments = typeFilteredProtocolComments.filter(x => x.isResolved === (value === 'resolved'));
          }
          if (type[0] === 'reviewer' && value) {
            typeFilteredProtocolComments = typeFilteredProtocolComments.filter(x => x.reviewerPersonId === value);
          }
        });
        this.sectionComments = this._toolKitService.groupBySection(typeFilteredProtocolComments);
      }
    } catch (e) { console.log(e); }

  }
  /**
   * Adding comments to the list which are emitted by the child component
   * @param comment
   */
  sectionCommentSaved(comment) {
    if (!this.sectionComments[comment.reviewSectionCode]) {
      this.sectionComments[comment.reviewSectionCode] = [];
    }
    this.showAddComment = [];
    this.sectionComments[comment.reviewSectionCode].unshift(comment);
    this.commentList.unshift(comment);
    this._toolKitService.$versionCommentList.next(this.commentList);
  }

    /**
   * updates all comments as well as grouped comments with delete and edit changes from child components
   * @param data
   */
  modifyCacheComments(data) {
    const { ac, type, comment } = data;
    switch (ac) {
      case 'D': // delete
        if (type === 'parent') {
          this.removeParentCommentFromAllComments(comment.awardReviewCommentId);
        }
        break;
      case 'E': // edit
        if (type === 'parent') {
          this.editParentCommentInAllComments(comment.awardReviewCommentId, comment);
        }
    }
  }

  findIndexOfParentComment(commentId) {
    if (commentId) {
      return this.commentList.findIndex(x => x.awardReviewCommentId === commentId);
    }
    return -1;
  }

  removeParentCommentFromAllComments(parentCommentId) {
    const index = this.findIndexOfParentComment(parentCommentId);
    this.commentList.splice(index, 1);
    this._toolKitService.$versionCommentList.next(this.commentList);
  }

  editParentCommentInAllComments(parentCommentId, comment) {
    const index = this.findIndexOfParentComment(parentCommentId);
    this.commentList[index] = comment;
    this._toolKitService.$versionCommentList.next(this.commentList);
  }
}
