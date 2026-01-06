import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { CommonService } from '../../common/services/common.service';
import { Subject ,  BehaviorSubject } from 'rxjs';
import { getParams } from '../../common/services/end-point.config';

@Injectable()
export class AwardService {

    isMandatory = new Subject();
    isAwardActive = new Subject();
    isRouteChangeTrigger = new Subject();
    isAwardTreeTrigger = new Subject();
    isAvailableRights = new Subject();
    isTrue;
    $isQuestionnaireChange = new Subject();
    $isSectionNavigation = new BehaviorSubject<boolean>(true);

    httpOptions: any = {};

    constructor(private _http: HttpClient, private _commonService: CommonService) { }

    submitAward(award) {
        return this._http.post(this._commonService.baseUrl + '/submitAward', award);
    }
    withdrawAward(withdrawAwardObject, uploadedFile) {
        const approveFormData = new FormData();
        if (uploadedFile) {
            for (let i = 0; i < uploadedFile.length; i++) {
                approveFormData.append('files', uploadedFile[i], uploadedFile[i].name);
            }
        }
        approveFormData.append('formDataJson', JSON.stringify(withdrawAwardObject));
        return this._http.post(this._commonService.baseUrl + '/withdrawAward', approveFormData );
    }
    bypassReviewer(bypassObj) {
        return this._http.post(this._commonService.baseUrl + '/byPassWorkFlowStop', bypassObj);
    }
    maintainAwardWorkFlow(requestObject, uploadedFile) {
        const approveFormData = new FormData();
        if (uploadedFile) {
            for (let i = 0; i < uploadedFile.length; i++) {
                approveFormData.append('files', uploadedFile[i], uploadedFile[i].name);
            }
        }
        approveFormData.append('formDataJson', JSON.stringify(requestObject));
        approveFormData.append('moduleCode', '1');
        approveFormData.append('subModuleCode', '0');
        return this._http.post(this._commonService.baseUrl + '/approveOrRejectWorkflow', approveFormData);
    }
    addAlternateApprover(alternateApproverObj) {
        return this._http.post(this._commonService.baseUrl + '/addAlternativeApprover ', alternateApproverObj);
    }
    getServiceRequestTypeBasedOnModule() {
        return this._http.get(`${this._commonService.baseUrl}/getServiceRequestTypeBasedOnModule/1`);
    }
    saveVariationRequset(serviceRequestObject, uploadedFiles) {
        const serviceRequestFormData = new FormData();
        if (uploadedFiles) {
            for (let i = 0; i < uploadedFiles.length; i++) {
                serviceRequestFormData.append('files', uploadedFiles[i], uploadedFiles[i].name);
            }
        }
        serviceRequestFormData.append('formDataJson', JSON.stringify(serviceRequestObject));
        return this._http.post(this._commonService.baseUrl + '/createAwardVariationRequest', serviceRequestFormData);
    }
    downloadRoutelogAttachment(attachmentId) {
        return this._http.get(this._commonService.baseUrl + '/downloadWorkflowAttachment', {
            headers: new HttpHeaders().set('attachmentId', attachmentId.toString()),
            responseType: 'blob'
        });
    }

    printAward(awardId) {
        return this._http.get(this._commonService.baseUrl + '/generateAwardReport', {
            headers: new HttpHeaders().set('awardId', awardId.toString())
                .set('personId', this._commonService.getCurrentUserDetail('personID'))
                .set('questionnaireMode', 'ANSWERED'),
            responseType: 'blob'
        });
    }
    maintainAward(params) {
        return this._http.post( this._commonService.baseUrl + '/maintainAwardHierarchy' , params  );
    }
    editVariationRequest(serviceRequestObject) {
        return this._http.post( this._commonService.baseUrl + '/saveServiceRequestFromAward' , serviceRequestObject  );
    }
    saveAwardMilestone(params) {
        return this._http.post( this._commonService.baseUrl + '/saveOrUpdateAwardMilestone' , params);
    }
    deleteProposalMileStone(params) {
        return this._http.post( this._commonService.baseUrl + '/deleteAwardMilestone' , params);
    }

    /** sets endpoint search options
     * @param params will have fetchLimit as one of the values 
     * to specify limit of data to fetched,
     * it should be given inside params as {'fetchLimit' : requiredLimit}
     * requiredLimit can be either null or any valid number.
     * if no limit is specified default fetch limit 50 will be used.
     * if limit is null then full list will return, this may cause performance issue.
     */
    setHttpOptions(contextField, formatString, path, defaultValue, params) {
      this.httpOptions.contextField = contextField;
      this.httpOptions.formatString = formatString;
      this.httpOptions.path = path;
      this.httpOptions.defaultValue = defaultValue;
      this.httpOptions.params = getParams(params);   
      return JSON.parse(JSON.stringify(this.httpOptions));
    }
    saveAwardWorkflowStatusForSponsor(params) {
        return this._http.post( this._commonService.baseUrl + '/saveAwardWorkflowStatusForSponsor' , params);
    }
    copyAward(params) {
        return this._http.post( this._commonService.baseUrl + '/copyAward', params );
    }
    generateWBSNumber(requestObject) {
        return this._http.post( this._commonService.baseUrl + '/generateWBSNumber', requestObject );
    }

    generateNotifyAwardReports(awardId, awardNumber, sequenceNumber) {
        return this._http.get(this._commonService.baseUrl + '/generateNotifyAwardReports', {
            headers: new HttpHeaders().set('awardId', awardId.toString())
            .set('updateUser', this._commonService.getCurrentUserDetail('userName'))
            .set('personId', this._commonService.getCurrentUserDetail('personID'))
            .set('awardNumber', awardNumber.toString())
            .set('sequenceNumber', sequenceNumber.toString()),
            responseType: 'blob'
        });
    }

    fetchHelpText(param) {
        return this._http.post(this._commonService.baseUrl + '/fetchHelpTexts', param );
    }
    getApplicableQuestionnaire(params) {
        return this._http.post(this._commonService.baseUrl + '/getApplicableQuestionnaire', params);
    }

    getSubModuleCodeBasedOnAwardNumber(awardNumber) {
        return this._http.get(`${this._commonService.baseUrl}/getSubModuleCodeBasedOnAwardNumber/${awardNumber}`, {});
    }

    deleteAward(awardId: number) {
        return this._http.delete(`${this._commonService.baseUrl}/deleteAward/${awardId}`);
      }

    canDeleteAward(awardId: number) {
        return this._http.get(`${this._commonService.baseUrl}/canDeleteAward/${awardId}`);
    }

}
