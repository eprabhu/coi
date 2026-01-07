import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DetailsService } from '../details.service';
import { CommonService } from '../../../common/services/common.service';
import { HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS } from '../../../app-constants';
import { CommonDataService } from '../../../award/services/common-data.service';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { WafAttachmentService } from '../../../common/services/waf-attachment.service';
import { fileDownloader } from '../../../common/utilities/custom-utilities';

@Component({
  selector: 'app-task-comments',
  templateUrl: './task-comments.component.html',
  styleUrls: ['./task-comments.component.css'],
  providers: [ WafAttachmentService ]
})
export class TaskCommentsComponent implements OnInit, OnDestroy {
  taskComment: any = {
    comments: '',
    taskId: '',
    actionLogId: '',
    updateTimestamp: '',
    updateUser: '',
    taskCommentAttachments: [],
    lastUpdateUserFullName: '',
  };
  taskCommentAttachments: any = [];
  isEmptyTextArea = false;
  taskId: any;
  commentList: any = [];
  uploadedFile: any = [];
  tempAttachment: any = [];
  isEditIndex = null;
  departmentRights: any = [];
  isModifyRight = false;
  isCreatedUser = {};
  $subscriptions: Subscription[] = [];
  taskStatus: any;
  taskCommentAttachmentWarning = null;
  isAssignee = false;
  assigneePersonId = null;
  isEditComment = false;
  editIndex: any;
  commentIndexKey = null;
  commentId = null;
  deleteFilecommentIndex: any;
  deleteFilecommentattachmentIndex: any;
  deleteFileAttachmentId: any;
  isSaving = false;


  constructor(private _detailsService: DetailsService, private route: ActivatedRoute,
    public _commonData: CommonDataService, private _commonService: CommonService,
    private _wafAttachmentService: WafAttachmentService) { }

  ngOnInit() {
    this.departmentRights = this._commonData.departmentLevelRights;
    this.taskId = this.route.snapshot.queryParamMap.get('taskId');
    this.fetchTaskComments();
    this.getPermissions();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  /** to fetch task comments */
  fetchTaskComments() {
    this.$subscriptions.push(this._detailsService.fetchTaskCommentsByTaskId({ 'taskId': this.taskId })
      .subscribe((data: any) => {
        this.commentList = data.taskComments || [];
        this.taskStatus = data.taskStatusCode;
        this.assigneePersonId = data.assigneePersonId;
        this.isCreatedUserCheck();
        this.isAssigneeCheck();
      }));
  }

  /** to check permission */
  getPermissions() {
    this.isModifyRight = this.departmentRights.find(element => element === 'MAINTAIN_TASK') ? true : false;
  }

  /** to check the whether the logged in person is assignee of the task */
  isAssigneeCheck() {
    this.isAssignee = (this.assigneePersonId === this._commonService.getCurrentUserDetail('personID'));
  }

  /** to check the person who commented is the one logged in */
  isCreatedUserCheck() {
    this.commentList.forEach(element => {
      this.isCreatedUser[element.commentId] = (element.updateUser === this._commonService.getCurrentUserDetail('userName'));
    });
  }

  /** setting the object for saving a comment */
  addComments() {
    this.taskComment.taskId = this.taskId;
    this.taskComment.updateUser = this._commonService.getCurrentUserDetail('userName');
    this.validateCommentTextArea();
    if (!this.taskComment.taskCommentAttachments) {
      this.taskComment.taskCommentAttachments = [];
    }
    if (!this.isEmptyTextArea) {
      if (this.isEditIndex) {
        this.filterNewAttachments();
        this.commentList.splice(this.commentList.indexOf(this.isEditIndex), 1);
      }
      this.saveComments();
    }
  }

/** to validate the comment box  */
  validateCommentTextArea() {
    this.isEmptyTextArea = (!this.taskComment.comments) ? true : false;
  }

  saveComments() {
    if (!this._commonService.isWafEnabled) {
      if (!this.isSaving) {
        this.isSaving = true;
        this.$subscriptions.push(this._detailsService.saveOrUpdateTaskComment(
          this.taskId, this.taskComment, this.taskCommentAttachments,
          this._commonService.getCurrentUserDetail('userName'), this.uploadedFile).subscribe((data: any) => {
            this.updateDataAfterSave(data);
            this.isSaving = false;
          }, err => {
             this._commonService.showToast(HTTP_ERROR_STATUS,(this.isEditComment?'Updating ':'Saving ')+"Task comment failed. Please try again.");
             this.isSaving = false;
           },
            () => {
              (this.isEditComment === true) ? this.toastForUpdatingComment() : this.toastForAddingComment();
              this.isSaving = false;
            }));
      }
    } else {
      this.saveTaskCommentForWaf();
    }
  }

  updateDataAfterSave(data) {
    this.commentList.unshift(data.taskComment);
    this.isEditIndex = null;
    this.taskComment = {};
    this.taskCommentAttachments = [];
    this.uploadedFile = [];
    this.taskCommentAttachmentWarning = null;
    this.isCreatedUserCheck();
  }

  /** If there are attachment, calls the 'saveAttachment' function with parameters in waf service for splitting attachment,returns data.
   * Otherwise calls saveWafRequest function in wafAttachmentService*/
  async saveTaskCommentForWaf() {
    const requestForWaf: any = {
      taskId:  this.taskId,
      taskComment: this.taskComment,
      taskCommentAttachments: this.taskCommentAttachments,
      'updateUser': this._commonService.getCurrentUserDetail('userName')

    };
    const requestSetAtRemaining = {
      taskCommentAttachments:  [],
    };
    if (this.uploadedFile.length > 0) {
      const data = await this._wafAttachmentService.saveAttachment(requestForWaf, requestSetAtRemaining, this.uploadedFile,
        '/saveOrUpdateTaskCommentForWAF', 'taskComment', this.taskCommentAttachments);
      this.checkTaskCommentSaved(data);
    } else {
      requestForWaf.taskCommentAttachments = this.taskCommentAttachments;
      this._wafAttachmentService.saveWafRequest(requestForWaf, '/saveOrUpdateTaskCommentForWAF').then((data: any) => {
        this.checkTaskCommentSaved(data);
      }).catch(error => {
        this.checkTaskCommentSaved(error);
      });
    }
  }

  /**
   * @param  {} data
   * if data doesn't contains error, saves faq details, otherwise shows error toast
   */
  checkTaskCommentSaved(data) {
    if (data && !data.error) {
      this.updateDataAfterSave(data);
      this.isEditComment === true ? this.toastForUpdatingComment() : this.toastForAddingComment();
    } else {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Waf blocked request for saving task comment');
    }
  }

  toastForUpdatingComment() {
    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Task comment updated successfully.');
    this.isEditComment = false;
  }

  toastForAddingComment() {
    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Task comment added successfully.');
  }

  editComment(index) {
    this.editIndex = index;
    this.isEditIndex = this.commentList[index];
    this.taskComment = Object.assign({}, this.commentList[index]);
    this.taskCommentAttachments = this.taskComment.taskCommentAttachments.slice();
    this.isEditComment = true;
  }

  /** to check is already persent attachments */
  filterNewAttachments() {
    this.taskCommentAttachments = this.taskCommentAttachments.filter(item => !item.attachmentId);
  }

  /**
   * @param  {} uploadedFiles : file information and the files
   * check duplication and oush the attachment
   */
  fileAttachment(uploadedFiles) {
    this.taskCommentAttachmentWarning = null;
    let dupCount = 0;
    for (const file of uploadedFiles) {
      if (this.checkDuplicateFiles(file)) {
        dupCount = dupCount + 1;
      } else {
        this.uploadedFile.push(file);
        this.prepareAttachment(file);
      }
    }
    if (dupCount > 0) {
      this.taskCommentAttachmentWarning = '* ' + dupCount + ' File(s) already added';
    }
  }

  /**
   * @param  {} index
   * checks for file duplication
   */
  checkDuplicateFiles(index) {
    return this.taskCommentAttachments.find(dupFile => dupFile.fileName === index.name &&
      dupFile.mimeType === index.type) || this.tempAttachment.find(dupFile => dupFile.fileName === index.name &&
        dupFile.mimeType === index.type) != null;
  }

  /**
   * @param  {} files : file information and the files
   * to push to temporary list
   */
  prepareAttachment(file) {
    this.tempAttachment.push({
      'taskId': this.taskId,
      'fileName': file.name,
      'mimeType': file.type,
      'updateUser': this._commonService.getCurrentUserDetail('userName')
    });
  }

  /**
   * @param  {} index
   * @param  {} attachmentIndex
   * @param  {} attachmentId
   * to delete an attachment for the comment section
   */
  deleteFile() {
    this.commentList[this.deleteFilecommentIndex].taskCommentAttachments.splice(this.deleteFilecommentattachmentIndex, 1);
    if (this.deleteFileAttachmentId != null) {
      this.$subscriptions.push(this._detailsService.deleteTaskCommentAttachment(
        { 'taskCommentAttachmentId': this.deleteFileAttachmentId }).subscribe((data: any) => {
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Attachment deleted successfully.');
        }));
    }
  }

  /**
   * @param  {} index
   * @param  {} attachmentId
   * to delete unpushed files
   */
  deleteUnpushedFile(index, attachmentId) {
    this.taskCommentAttachments.splice(index, 1);
    if (attachmentId) {
      if (this.taskComment.taskCommentAttachments) {
        this.taskComment.taskCommentAttachments.splice(index, 1);
      }
      this.$subscriptions.push(this._detailsService.deleteTaskCommentAttachment(
        { 'taskCommentAttachmentId': attachmentId }).subscribe((data: any) => {
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Attachment deleted successfully.');
        }));
    }
  }

  /**
   * @param  {} index
   * @param  {} commentId : id of comment
   * to delete comment
   */
  deleteComment(index, commentId) {
    this.$subscriptions.push(this._detailsService.deleteTaskComment({
      'taskCommentId': commentId , 'taskId': this.taskId, 'updateUser': this._commonService.getCurrentUserDetail('userName')
    })
      .subscribe((data: any) => {
      }, err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Deleting comment  failed. Please try again.'); },
        () => {
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Task comment deleted successfully.');
          this.commentList.splice(index, 1);
        }));
  }

  /**
  * @param  {} attachment
  * Download comments attachments
  */
  downloadTaskCommentAttachment(attachment) {
    this.$subscriptions.push(this._detailsService.downloadTaskCommentAttachment(attachment.attachmentId)
      .subscribe(data => {
        fileDownloader(data, attachment.fileName);
      }));
  }

  cancelUploadAttachments() {
    this.taskCommentAttachments = this.taskCommentAttachments.filter(item => !this.tempAttachment.includes(item));
    this.taskCommentAttachmentWarning = null;
    this.tempAttachment = [];
  }

  addUploadAttachments() {
    this.taskCommentAttachments = this.taskCommentAttachments.concat(this.tempAttachment);
    this.tempAttachment = [];
  }
  setAttachmentDeleteIndex(commentIndex, attachmentIndex, attachmentId) {
    this.deleteFilecommentIndex = commentIndex;
    this.deleteFilecommentattachmentIndex = attachmentIndex;
    this.deleteFileAttachmentId = attachmentId;
  }
}
