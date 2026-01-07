import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from '../services/common.service';
import { CHUNK_SIZE } from '../../app-constants';

@Injectable()
export class WafAttachmentService {
  file;
  fileSize;
  chunks;
  chunk;
  remaining = 0;
  offset;
  piece;
  promise;
  wafRequest: any = {};
  serviceName;
  actionType;
  uploadIndex = 0;

  constructor(private _http: HttpClient, private _commonService: CommonService) { }
  /**
  * @param  {} initialRequest
  * @param  {} requestsetAtRemaining
  * @param  {} uploadedFile
  * @param  {} serviceName
  * @param  {} actionType
  * @param  {} attachmentDetails
  * sets initial request for waf,requestsetAtRemaining that is required at remaining = 0,serviceName,
  * actionType determines the action which is used to set requestObject or update requestObject from response at remaining = 0
  * attachmentDetails is the array which contains the details (i.e. in case of grant call,proposal etc,
  * each file has attachment type,description and status related to all files.It should be given as an object while adding each file.
  * returns data or error to the component which calls this function
  */
  async saveAttachment(initialRequest, requestsetAtRemaining, uploadedFile, serviceName, actionType, attachmentDetails) {
    this.serviceName = serviceName;
    this.actionType = actionType;
    for (let index = 0; index < uploadedFile.length; index++) {
      this.uploadIndex = index;
      if (attachmentDetails) {
        this.setNewAttachmentObject(initialRequest, requestsetAtRemaining, attachmentDetails[index]);
      }
      const data: any = await this.singleFileSave(initialRequest, requestsetAtRemaining, uploadedFile[index], uploadedFile.length);
      if (this.actionType === 'createVariation' && !data.canCreateVariationRequest) {
        return data;
      }
      if (uploadedFile.length - 1 === index || data.error) {
        return data;
      }
    }
  }
  /**
 * @param  {} initialRequest
 * @param  {} requestsetAtRemaining
 * @param  {} attachmentDetails
 * sets attachment details object (details of each file) to request object based on action type
 */
  setNewAttachmentObject(initialRequest, requestsetAtRemaining, attachmentDetailObject) {
    switch (this.actionType) {
      case 'grantAttachment':
        requestsetAtRemaining.newAttachment = attachmentDetailObject;
        break;
      case 'proposalAttachment':
        requestsetAtRemaining.proposalAttachment = attachmentDetailObject;
        break;
      case 'awardAttachment':
        requestsetAtRemaining.awardAttachment = attachmentDetailObject;
        break;
      /* object is set in all cases need to verify at backend */
      case 'variationAttachment':
      case 'createVariation':
        initialRequest.serviceRequestAttachment = attachmentDetailObject;
        break;
      case 'task':
        initialRequest.taskAttachment = attachmentDetailObject;
        break;
      case 'taskComment':
        initialRequest.taskCommentAttachment = attachmentDetailObject;
        break;
      default: break;
    }
  }
  /**
   * @param  {} initialRequest
   * @param  {} requestsetAtRemaining
   * @param  {} file
   * @param  {} uploadedFileLength
   * initialize variables and file , calls function for splitting the file which returns resolved value of promise
   */
  async singleFileSave(initialRequest, requestsetAtRemaining, file, uploadedFileLength) {
    this.initialiseWafVariables();
    this.setFileToSlice(initialRequest, file);
    return new Promise((resolve) => {
      this.performSplitActions(initialRequest, requestsetAtRemaining, uploadedFileLength, resolve);
    });
  }
  /** intialise variables required for splitting each file */
  initialiseWafVariables() {
    this.chunk = 0;
    this.remaining = 0;
    this.offset = 0;
    this.piece = 0;
    this.chunks = 0;
  }
  /**
   * @param  {} initialRequest
   * @param  {} file
   * sets file to slice and file details to initial request, finds chunks which determines the number of splitting required,
   * which is calculated using file size and chunk size(constant value read from app-constants).
   * Reverify the use of this.file and this.fileSize as global variable
   */
  setFileToSlice(initialRequest, file) {
    this.file = file;
    this.fileSize = file.size;
    this.chunks = Math.ceil(this.fileSize / CHUNK_SIZE);
    initialRequest.contentType = this.file.type;
    initialRequest.fileName = this.file.name;
    initialRequest.fileTimestamp = new Date().getTime();
  }
  /**
   * @param  {} initialRequest
   * @param  {} requestsetAtRemaining
   * @param  {} uploadedFileLength
   * @param  {} promise
   * promise (resolve of promise) which sets to this.promise.It resolves with the data on completion of splitting of each file.
   * sets flags which need to set at remaining = 0 to waf request.In cases where some objects need to set at remaining 0,
   * assigns intial request and request that should be set at the time of remaining = 0 to waf request.
   * On all other values of remaining , the all keys of requestsetAtRemaining object should be null.
   * Then reads the file content from sliced piece of file, removes base64, string from each file content.
   */
  async performSplitActions(initialRequest, requestsetAtRemaining, uploadedFileLength, promise) {
    if (promise) {
      this.promise = promise;
    }
    this.sliceFiletosave();
    this.wafRequest = {};
    if (this.remaining === 0) {
      this.setFlag(initialRequest, uploadedFileLength);
      this.wafRequest = Object.assign(initialRequest, requestsetAtRemaining);
    } else {
      this.wafRequest = Object.assign(initialRequest, this.setRequestRemainingKeysNull(requestsetAtRemaining));
    }
    if (this.remaining !== -1) {
      const reader = new FileReader();
      reader.readAsDataURL(this.piece);
      reader.onload = async () => {
        const text = reader.result.toString().split('base64,').pop();
        this.setWafRequest(text);
        this.saveActions(initialRequest, requestsetAtRemaining, uploadedFileLength);
      };
    }
  }
  /**
   * @param  {} request
   * sets all keys of requestSetAtRemaining object to null and returns request
   */
  setRequestRemainingKeysNull(requestsetAtRemaining) {
    const request = Object.assign({}, requestsetAtRemaining);
    if (request) {
      Object.keys(request).forEach(k => request[k] = null);
    }
    return request;
  }
  /**finds offset for slicing file, remaining determines remaining number of splits for a file,
   *  splits completes at remaining = 0.piece is the sliced file  */
  sliceFiletosave() {
    this.offset = this.chunk * CHUNK_SIZE;
    this.chunk++;
    this.remaining = this.chunks - this.chunk;
    this.piece = this.remaining === 0 ? this.file.slice(this.offset, this.fileSize) :
      this.file.slice(this.offset, this.offset + CHUNK_SIZE);
  }
  /**
   * @param  {} text
   * sets remaining ,length and filecontent which varies for each request of splitting file.
   */
  setWafRequest(text) {
    this.wafRequest.remaining = this.remaining;
    this.wafRequest.length = this.piece.size;
    this.wafRequest.fileContent = text;
  }
  /**
   * @param  {} initialRequest
   * @param  {} requestsetAtRemaining
   * @param  {} uploadedFileLength
   * calls saveWafRequest function, splitting continues until chunks(no.of splits required) > chunk,
   * resolves with data at the completion of splitting of each file. Otherwise throws error
   */
  async saveActions(initialRequest, requestsetAtRemaining, uploadedFileLength) {
    try {
      const data: any = await this.saveWafRequest(this.wafRequest, this.serviceName);
      if (this.remaining === 0) {
        this.updateRequestFromResponse(data, initialRequest);
      }
      if (this.actionType === 'createVariation' && !data.canCreateVariationRequest) {
        this.promise(data);
      }
      (this.chunks > this.chunk) ? this.performSplitActions(initialRequest, requestsetAtRemaining, uploadedFileLength, null) :
        this.promise(data);
    } catch (error) {
      this.promise(error);
    }
  }
  /**
   * @param  {} wafRequest
   * @param  {} serviceName
   */
  saveWafRequest(wafRequest, serviceName) {
    return this._http.post(this._commonService.baseUrl + serviceName, wafRequest).toPromise();
  }
  /**
   * @param  {} initialRequest
   * @param  {} uploadedFileLength
   * set flag in the request at remaining = 0 based on action type
   * For complete, return, endorse actions of proposal evaluation, actionType is passed as 'completeEvaluation'.
   * value of 'isLastUploadedFile' in intialrequest need to set to true for remaining = 0 of last uploaded file.The value should be
   * false for all other values of remaining .
   * For Add Comments & Attachments in variation request and Create variation request in award, value of 'isLastUploadedFile' in
   * intialrequest need to set to true for remaining = 0 of first uplaoded file.The value should be false for
   * all other values of remaining .
   */
  setFlag(initialRequest, uploadedFileLength) {
    switch (this.actionType) {
      case 'completeEvaluation':
        initialRequest.isLastUploadedFile = uploadedFileLength - 1 === this.uploadIndex ? true : false;
        break;
      case 'variationAttachment':
        initialRequest.isLastUploadedFile = this.uploadIndex === 0 ? true : false;
        break;
      case 'createVariation':
        initialRequest.isLastUploadedFile = this.uploadIndex === 0 ? true : false;
        initialRequest.isFirstTimeCreation = this.uploadIndex === 0 ? true : false;
        initialRequest.isLastRequest = uploadedFileLength - 1 === this.uploadIndex ? true : false;
        break;
      case 'awardWorkflow':
        initialRequest.isLastRequest = uploadedFileLength - 1 === this.uploadIndex ? true : false;
          break;
      default: break;
    }
  }
  /**
   * @param  {} data
   * @param  {} initialRequest
   * At remaining = 0, certain parameters of initial request need to be updated from response data
   */
  updateRequestFromResponse(data, initialRequest) {
    switch (this.actionType) {
      case 'writeReview':
        initialRequest.preNewReviewComment = data.preNewReviewComment;
        break;
      case 'completeReview':
        initialRequest.preNewReviewComment = data.preNewReviewComment;
        initialRequest.reviewerReview = data.reviewerReview;
        break;
      case 'commentEvaluation':
      case 'completeEvaluation':
        initialRequest.newReviewComment = data.newReviewComment;
        break;
      case 'awardWorkflow':
        initialRequest.workflowDetailId = data.workflowDetailId;
        initialRequest.isFinalApprover = data.isFinalApprover;
        break;
      case 'createVariation':
        initialRequest.serviceRequestId = data.serviceRequest ? data.serviceRequest.serviceRequestId : null;
        initialRequest.latestAwardId = data && data.award ? data.award.awardId : null;
        break;
      case 'variationAttachment':
        initialRequest.actionLogId = data.actionLogId;
        break;
      case 'faq':
        initialRequest.faqdtls = data.faqdtls;
        break;
      case 'task':
        initialRequest.task = data.task;
        break;
      case 'taskComment':
        initialRequest.taskComment = data.taskComment;
      default: break;
      case 'awardWithdraw':
        initialRequest.workflowDetailId = data.workflowDetailId;
        initialRequest.isFinalApprover = data.isFinalApprover;
        break;
    }
  }
}
