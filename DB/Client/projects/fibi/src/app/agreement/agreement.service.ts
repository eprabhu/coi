import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonService } from './../common/services/common.service';
import { Injectable } from '@angular/core';
import { Subject ,  BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable()
export class AgreementService {

  $isActivityAdded = new Subject();
  $getNegotiationLookUp = new BehaviorSubject<any>('');
  deployMap = environment.deployUrl ;

  constructor(private _commonService: CommonService, private _http: HttpClient) { }

  saveAgreementDetails(agreementDetails, isTypeChanged, moduleDetails, isPI) {
    const agreementAssociationDetails = !isPI ? moduleDetails : [];
     return this._http.post(this._commonService.baseUrl + '/saveOrUpdateAgreement',
        {
          'agreementHeader': agreementDetails,
          'agreementAssociationDetails': agreementAssociationDetails,
          'personId': this._commonService.getCurrentUserDetail('personID'),
          'isTypeChanged': isTypeChanged,
          'updateUser' : this._commonService.getCurrentUserDetail('userName')
        });
  }

  getApplicableQuestionnaire(params) {
    return this._http.post(this._commonService.baseUrl + '/getApplicableQuestionnaire', params);
  }

  saveOrUpdateOrganisation(params) {
    return this._http.post(this._commonService.baseUrl + '/saveOrUpdateOrganisation', params);
  }

  saveOrUpdateOrganisationContact(params) {
    return this._http.post(this._commonService.baseUrl + '/saveOrUpdateOrganisationContact', params);
  }

  deleteAgreementSponsorContact(param) {
    return this._http.post(this._commonService.baseUrl + '/deleteAgreementSponsorContact', param);
  }

  deleteAgreementSponsor(param) {
    return this._http.post(this._commonService.baseUrl + '/deleteAgreementSponsor', param);
  }

  saveAgreementPeople(personDetails) {
    return this._http.post(this._commonService.baseUrl + '/saveAgreementPeople', { 'agreementPeople': personDetails });
  }

  deleteAgreementPeople(param) {
    return this._http.post(this._commonService.baseUrl + '/deleteAgreementPeople', param);
  }

  submitAgreement(param) {
    return this._http.post(this._commonService.baseUrl + '/submitAgreement', param);
  }

  getAgreementHistory(agreementRequestId) {
    return this._http.get(this._commonService.baseUrl + '/getAgreementHistory', {
      headers: new HttpHeaders().set('agreementRequestId', agreementRequestId.toString()),
      responseType: 'json'
    });
  }

  generateAgreement(params) {
    return this._http.post(this._commonService.baseUrl + '/generateAgreementReport', params);
  }

  readyToExecute(params) {
    return this._http.post(this._commonService.baseUrl + '/readyToExecute', params);
  }

  finalizeAgreement(params, uploadedFile) {
    const formData = new FormData();
    for (const file of uploadedFile) {
      formData.append('files', file);
    }
    formData.append('formDataJson', JSON.stringify(params));
    return this._http.post(this._commonService.baseUrl + '/finalizeAgreement', formData);
  }

  submitAgreementReview(reviewObject) {
    return this._http.post(this._commonService.baseUrl + '/submitAgreementReview', reviewObject);
  }

  downloadAgreementTemplate(attachmentId, type) {
    return this._http.get(this._commonService.baseUrl + '/downloadAgreementAttachment', {
      headers: new HttpHeaders().set('attachmentId', attachmentId.toString())
        .set('exportType', type),
      responseType: 'blob'
    });
  }

  previewAgreementDocument(previewObject) {
    return this._http.post(this._commonService.baseUrl + '/previewAgreementDocument', previewObject,
      { headers: new HttpHeaders(), responseType: 'blob' });
  }

  completeReview(agreementRequestId) {
    return this._http.post(this._commonService.baseUrl + '/completeReview', agreementRequestId);
  }

  addReviewComment(commentObject, uploadedFiles) {
    const formData = new FormData();
    for (const file of uploadedFiles) {
      formData.append('files', file);
    }
    formData.append('formDataJson', JSON.stringify(commentObject));
    return this._http.post(this._commonService.baseUrl + '/addAgreementComment', formData);
  }

  returnAgreement(showCommentObject, uploadedFiles) {
    const formData = new FormData();
    for (const file of uploadedFiles) {
      formData.append('files', file);
    }
    formData.append('formDataJson', JSON.stringify(showCommentObject));
    return this._http.post(this._commonService.baseUrl + '/returnAgreement', formData);
  }

  startReview(startReviewObject) {
    return this._http.post(this._commonService.baseUrl + '/startReview', startReviewObject);
  }

  addAgreementAttachment(params, uploadedFile) {
    const formData = new FormData();
    for (const file of uploadedFile) {
      formData.append('files', file);
    }
    formData.append('formDataJson', JSON.stringify(params));
    return this._http.post(this._commonService.baseUrl + '/addAgreementAttachment', formData);
  }

  makeAsFinal(param) {
    return this._http.post(this._commonService.baseUrl + '/markAttachmentAsFinal', param);
  }

  deleteAgreementComment(param) {
    return this._http.post(this._commonService.baseUrl + '/deleteAgreementComment', param);
  }

  copyAgreement(requestObject) {
    return this._http.post(this._commonService.baseUrl + '/copyAgreement', requestObject);
  }

  downloadAttachment(attachmentId) {
    return this._http.get(this._commonService.baseUrl + '/downloadNegotiationAttachment', {
      headers: new HttpHeaders().set('attachmentId', attachmentId.toString()),
      responseType: 'blob'
    });
  }

  saveOrganisationToSearch(params) {
    return this._http.post(this._commonService.baseUrl + '/saveOrganizations', params);

  }

  maintainSponsorData(sponsor) {
    return this._http.post(this._commonService.baseUrl + '/saveSponsor', sponsor);
  }

  downloadCommentAttachment(param) {
    return this._http.post(this._commonService.baseUrl + '/downloadCommentAttachment', param,
      { headers: new HttpHeaders(), responseType: 'blob' });
  }

  deleteCommentAttachment(param) {
    return this._http.post(this._commonService.baseUrl + '/deleteCommentAttachment', param);
  }

  maintainAgreementWorkFlow(requestObject, uploadedFile) {
    const approveFormData = new FormData();
    if (uploadedFile) {
      for (let i = 0; i < uploadedFile.length; i++) {
        approveFormData.append('files', uploadedFile[i], uploadedFile[i].name);
      }
    }
    approveFormData.append('formDataJson', JSON.stringify(requestObject));
    approveFormData.append('moduleCode', '13');
    approveFormData.append('subModuleCode', '0');
    return this._http.post(this._commonService.baseUrl + '/approveOrRejectWorkflow', approveFormData);
  }

  getActionComments(param) {
    return this._http.post(this._commonService.baseUrl + '/getActionComments', param);
  }

  exportAgreement(agreementId) {
    return this._http.get(this._commonService.baseUrl + '/printEntireAgreement', {
      headers: new HttpHeaders().set('agreementRequestId', agreementId.toString())
        .set('personId', this._commonService.getCurrentUserDetail('personID'))
        .set('userName', this._commonService.getCurrentUserDetail('userName'))
        .set('questionnaireMode', 'ANSWERED'),
      responseType: 'blob'
    });
  }

  transferAgreement(params) {
    return this._http.post(this._commonService.baseUrl + '/transferAgreement', params);
  }

  terminateAgreement(params) {
    return this._http.post(this._commonService.baseUrl + '/terminateAgreement', params);
  }

  abandonAgreement(params) {
    return this._http.post(this._commonService.baseUrl + '/abandonAgreement', params);
  }

  reopenAgreement(params) {
    return this._http.post(this._commonService.baseUrl + '/reopenAgreement', params);
  }

  generateAgreementSummary(agreementId) {
    return this._http.get(this._commonService.baseUrl + '/generateAgreementSummary',
      {
        headers: new HttpHeaders().set('agreementRequestId', agreementId.toString())
          .set('personId', this._commonService.getCurrentUserDetail('personID'))
          .set('userName', this._commonService.getCurrentUserDetail('userName'))
          .set('questionnaireMode', 'ANSWERED'),
        responseType: 'blob'
      });
  }

  linkModuleToAgreement(moduleCode, moduleItemKey, agreementId, acType) {
    if (acType === 'I') {
      return this._http.post(this._commonService.baseUrl + '/linkModuleToAgreement',
        {
          'moduleCode': moduleCode,
          'moduleItemKey': moduleItemKey,
          'agreementRequestId': agreementId,
          'updateUser': this._commonService.getCurrentUserDetail('userName'),
          'personId': this._commonService.getCurrentUserDetail('personID'),
          'acType': acType
        });
    } else {
      return this._http.post(this._commonService.baseUrl + '/linkModuleToAgreement',
        {
          'moduleCode': moduleCode,
          'moduleItemKey': moduleItemKey,
          'agreementRequestId': agreementId,
          'acType': acType
        });
    }
  }

  getId() {
    return this._http.get(this.deployMap + 'assets/app-config.json');
  }

  findDepartment(unitNumber) {
    return this._http.post(this._commonService.baseUrl + '/findDepartment', { 'searchString': unitNumber });
  }

  deleteAttachmentByid(attachmentId) {
    return this._http.post(this._commonService.baseUrl + '/deleteActivityAttachments', { 'negotiationsAttachmentId': attachmentId });
  }

  setAttachment(negotiationData, uploadedFiles) {
    const formData = new FormData();
    if (uploadedFiles.length > 0) {
      uploadedFiles.forEach(file => {
        formData.append('files', file);
      });
    }
    formData.append('formDataJson', JSON.stringify({ 'negotiationActivity': negotiationData }));
    return this._http.post(this._commonService.baseUrl + '/maintainNegotiationActivity', formData);
  }

  loadAgreementNegotiation(param) {
    return this._http.post(this._commonService.baseUrl + '/loadAgreementNegotiation', param);
  }

  getPersonGroup (personId) {
    return this._http.get(this._commonService.baseUrl + '/getPersonGroup ', {
      headers: new HttpHeaders().set('personId', personId.toString())
    });
  }

  assignAgreementAdmin(params) {
    return this._http.post(this._commonService.baseUrl + '/assignAgreementAdmin', params);
  }

  deleteAgreementRecord(agreementId: number) {
    return this._http.delete(`${this._commonService.baseUrl}/deleteAgreement/${agreementId}`);
  }
}
