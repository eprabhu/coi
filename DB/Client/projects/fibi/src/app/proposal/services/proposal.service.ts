/** last updated by Ramlekshmy I on 15-10-2019 **/
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { CommonService } from '../../common/services/common.service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Subject } from 'rxjs';
import { NotificationModalConfig } from '../interface/proposal.interface';
import { getParams } from '../../common/services/end-point.config';

@Injectable()
export class ProposalService {
    httpOptions: any = {};
    departmentLevelRightsForProposal: any = {
        isModifyProposal: false,
        isWithdrawProposal: false,
        isMaintainProposalBudget: false,
        isDefineApprovedBudget: false,
        isModifyProposalAttachments: false,
        isModifyPermissions: false,
        canCreateIP: false
    };
    proposalMode = 'edit';
    proposalSectionConfig: any = {};
    proposalDetails: any = {};

    proposalStartDate: any;
    proposalEndDate: any;
    sponsorDeadlineDate: any;
    internalDeadLineDate: any;
    proposalTitle: any;
    $currentTab = new BehaviorSubject<any>(null);
    dataEvent = new Subject();
    notifyModalData = new Subject<NotificationModalConfig>();
    proposalDateChangeType = null;
    $isShowDateWarning = new Subject();
    $isPeriodOverlapped = new Subject();
    isDatesChanged = false;
    showRequestModal: any = {};
    supportReq: any = {
        moduleItemCode: 3,
        moduleSubItemCode: 0,
        moduleItemKey: '',
        moduleSubItemKey: '0',
        reviewTypeCode: '2'
    };
    preReviewReq: any = {
        moduleItemCode: 3,
        moduleSubItemCode: 0,
        moduleItemKey: '',
        moduleSubItemKey: '0',
        reviewTypeCode: '1',
        reviewSectionTypeCode: '1'
    };
    proposalDataBindObj: any = {
        mandatoryList: new Map(),
        dateWarningList: new Map()
    };
    dataVisibilityObj: any = {
        mode: 'view',
        currentTab: (localStorage.getItem('currentTab') == null) ? 'PROPOSAL_HOME' : localStorage.getItem('currentTab'),
        isGrantCallWdgtOpen: true,
        isAreaOfResearchWidgetOpen: true,
        isKeyPersonWidgetOpen: true,
        isMoreInfoWdgtOpen: true,
        isSpecialReviewWidgetOpen: true,
        isBudgetWdgtOpen: true,
        isAttachmentListOpen: true,
        isAttachmentEditable: false,
        isBudgetPeriodDate: false,
        isAttachmentVersionOpen: [],
        selectedVersion: 1,
        isbudgetDetils: false,
        isbudget: true,
        isMultiPI: false,
        BudgetTab: null,
        personnelFrom: 'DETAILBUDGET',
        isEvaluationFormEdittable: [],
        isBudgetHeaderFound: false,
        proposalStatus: null,
        isBudgetHeaderEdited: false,
        grantCallId: null,
        isPanelNotSeleceted: false,
        isNoPersonSeleceted: false
    };

    constructor(private _http: HttpClient, public _commonService: CommonService) { }

    createProposal(params) {
        return this._http.post(this._commonService.baseUrl + '/createProposal', params);
    }

    loadProposalById(params) {
        return this._http.post(this._commonService.baseUrl + '/loadProposalById', params);
    }

    saveProposal(params) {
        return this._http.post(this._commonService.baseUrl + '/saveOrUpdateProposal', params);
    }

    submitProposal(params) {
        return this._http.post(this._commonService.baseUrl + '/submitProposal', params);
    }

    printProposal(params) {
        return this._http.post(this._commonService.baseUrl + '/generateProposalReport', params, {responseType: 'blob'});
    }

    withdrawProposal(params) {
        return this._http.post(this._commonService.baseUrl + '/withdrawProposal', params);
    }

    approveDisapproveProposal(formData) {
        return this._http.post(this._commonService.baseUrl + '/approveOrRejectWorkflow', formData);
    }

    sendDocCompleteApproverNotification(proposal) {
        return this._http.post(this._commonService.baseUrl + '/sendAttachApproverNotification', proposal, { responseType: 'text' });
    }

    sendPIAttachmentNotification(proposal) {
        return this._http.post(this._commonService.baseUrl + '/sendAttachPINotification', proposal, { responseType: 'text' });
    }

    addProposalAttachment(uploadedFile, proposalId, newAttachments) {
        const formData = new FormData();
        for (const file of uploadedFile) {
            formData.append('files', file, file.name);
        }
        formData.append('formDataJson', JSON.stringify({
            'proposalId': proposalId, 'newAttachments': newAttachments,
            'userFullName': this._commonService.getCurrentUserDetail('fullName'),
            'updateUser': this._commonService.getCurrentUserDetail('userName')
        }));
        return this._http.post(this._commonService.baseUrl + '/addProposalAttachment', formData);
    }

    downloadProposalAttachment(attachmentId) {
        return this._http.get(this._commonService.baseUrl + '/downloadProposalAttachment', {
            headers: new HttpHeaders().set('attachmentId', attachmentId.toString()),
            responseType: 'blob'
        });
    }

    deleteProposalAttachment(params) {
        return this._http.post(this._commonService.baseUrl + '/deleteProposalAttachment', params);
    }

    fetchSortedAttachments(params) {
        return this._http.post(this._commonService.baseUrl + '/fetchSortedAttachments', params);
    }

    addReviewComment(formData) {
        return this._http.post(this._commonService.baseUrl + '/addReviewComment', formData);
    }

    addReview(params) {
        return this._http.post(this._commonService.baseUrl + '/addReview', params);
    }

    approveOrDisapproveReview(params) {
        return this._http.post(this._commonService.baseUrl + '/approveOrDisapproveReview', params);
    }

    downloadReviewAttachment(attachmentId) {
        return this._http.get(this._commonService.baseUrl + '/downloadReviewAttachment', {
            headers: new HttpHeaders().set('attachmentId', attachmentId.toString()),
            responseType: 'blob'
        });
    }

    saveProposalRank(params) {
        return this._http.post(this._commonService.baseUrl + '/saveRankFromDashboard', params);
    }

    deleteReviewComment(params) {
        return this._http.post(this._commonService.baseUrl + '/deleteReviewComment', params);
    }

    sortReviewerFields(params) {
        return this._http.post(this._commonService.baseUrl + '/fetchSortedReviewsForEvaluation', params);
    }

    loadProposalAttachments(params) {
        return this._http.post(this._commonService.baseUrl + '/loadProposalAttachments', params);
    }

    updateAttachmentDetails(params) {
        return this._http.post(this._commonService.baseUrl + '/updateAttachmentDetails', params);
    }

    loadEvaluationDetails(params) {
        return this._http.post(this._commonService.baseUrl + '/loadEvaluationDetails', params);
    }


    copyProposal(proposal) {
        return this._http.post(this._commonService.baseUrl + '/copyProposal', proposal);
    }

    /* exports proposal as zip */
    printEntireProposal(params) {
        return this._http.post(this._commonService.baseUrl + '/printEntireProposal', params, { responseType: 'blob' });
    }

    /*get proposal templates */
    getLetterTemplates() {
        return this._http.get(this._commonService.baseUrl + '/letterTemplate/3');
    }
    /** sets endpoint search options
     * @param contextField
     * @param formatString
     * @param path
     * @param defaultValue
     * @param params  will have fetchLimit as one of the values 
    * to specify limit of data to fetched,
    * it should be given inside params as {'fetchLimit' : requiredLimit}
    * requiredLimit can be either null or any valid number.
    * if no limit is specified default fetch limit 50 will be used.
    * if limit is null then full list will return, this may cause performance issue.
    * /findGrantCall endpoint do not have limit in backend, so condition check added.
    */
    setHttpOptions(contextField, formatString, path, defaultValue, params = {}) {
        this.httpOptions.contextField = contextField;
        this.httpOptions.formatString = formatString;
        this.httpOptions.path = path;
        this.httpOptions.defaultValue = defaultValue;
        if (['findGrantCall'].includes(path)) {
            this.httpOptions.params = params; 
        } else {
            this.httpOptions.params = getParams(params);   
        }
        return JSON.parse(JSON.stringify(this.httpOptions));
    }

    checkDepartmentLevelPermission(rightsArray) {
        this.departmentLevelRightsForProposal.isModifyProposal = this.checkDepartmentLevelRightsInArray(rightsArray, 'MODIFY_PROPOSAL');
        this.departmentLevelRightsForProposal.isWithdrawProposal = this.checkDepartmentLevelRightsInArray(rightsArray, 'WITHDRAW_PROPOSAL');
        this.departmentLevelRightsForProposal.isMaintainProposalBudget =
            this.checkDepartmentLevelRightsInArray(rightsArray, 'MAINTAIN_PROPOSAL_BUDGET');
        this.departmentLevelRightsForProposal.isDefineApprovedBudget =
            this.checkDepartmentLevelRightsInArray(rightsArray, 'DEFINE_APPROVED_BUDGET');
        this.departmentLevelRightsForProposal.isModifyProposalAttachments =
            this.checkDepartmentLevelRightsInArray(rightsArray, 'MODIFY_PROPOSAL_ATTACHEMNTS');
        this.departmentLevelRightsForProposal.isModifyPermissions =
            this.checkDepartmentLevelRightsInArray(rightsArray, 'MODIFY_DOCUMENT_PERMISSION');
        this.departmentLevelRightsForProposal.isMaintainPrivateComment =
            this.checkDepartmentLevelRightsInArray(rightsArray, 'MAINTAIN_PRIVATE_COMMENTS');
        this.departmentLevelRightsForProposal.isDeactivateProposal =
            this.checkDepartmentLevelRightsInArray(rightsArray, 'DEACTIVATE_PROPOSAL');
        this.departmentLevelRightsForProposal.isDeleteProposal =
            this.checkDepartmentLevelRightsInArray(rightsArray, 'DELETE_PROPOSAL');
        this.departmentLevelRightsForProposal.isCreateProposal =
            this.checkDepartmentLevelRightsInArray(rightsArray, 'CREATE_PROPOSAL');
        this.departmentLevelRightsForProposal.isCreateAdminCorrection =
            this.checkDepartmentLevelRightsInArray(rightsArray, 'PD_ADMIN_CORRECTION');
        this.departmentLevelRightsForProposal.canCreateIP =
            this.checkDepartmentLevelRightsInArray(rightsArray, 'CREATE_INST_PROPOSAL');
        return this.departmentLevelRightsForProposal;
    }

    checkDepartmentLevelRightsInArray(rightsArray, input) {
        if (rightsArray != null && rightsArray.length) {
            return rightsArray.includes(input);
        } else {
            return false;
        }
    }

    downloadAllAttachments(params) {
        return this._http.post(this._commonService.baseUrl + '/exportSelectedAttachments', params,
            { observe: 'response', responseType: 'blob' });
    }

    downloadAllPersonAttachments(params) {
        return this._http.post(this._commonService.baseUrl + '/exportProposalPersonAttachments', params,
            { observe: 'response', responseType: 'blob' });
    }

    addReviewer(params) {
        return this._http.post(this._commonService.baseUrl + '/addReviewer', params);
    }

    downloadRoutelogAttachment(attachmentId) {
        return this._http.get(this._commonService.baseUrl + '/downloadWorkflowAttachment', {
            headers: new HttpHeaders().set('attachmentId', attachmentId.toString()),
            responseType: 'blob'
        });
    }

    updateAttachmentStatus(params) {
        return this._http.post(this._commonService.baseUrl + '/updateAllAttachmentStatus', params);
    }

    setProposalStatusInActive(params) {
        return this._http.post(this._commonService.baseUrl + '/updateProposaStatusAsInactive', params);
    }

    // milestone services
    saveUpdateMilestone(params) {
        return this._http.post(this._commonService.baseUrl + '/saveOrUpdateProposalMileStone', params);
    }

    deleteProposalMileStone(params) {
        return this._http.post(this._commonService.baseUrl + '/deleteProposalMileStone', params);
    }

    getEvaluationPersonsBasedOnRole(roleId, unitNumber) {
        return this._http.get(this._commonService.baseUrl + '/getEvaluationPersonsBasedOnRole', {
            headers: new HttpHeaders().set('personRoleId', roleId.toString()).set('unitNumber', unitNumber)
        });
    }

    fetchHelpText(param) {
        return this._http.post(this._commonService.baseUrl + '/fetchHelpTexts', param);
    }
    recallProposal(recallObject, uploadedFile) {
        const approveFormData = new FormData();
        if (uploadedFile) {
            for (let i = 0; i < uploadedFile.length; i++) {
                approveFormData.append('files', uploadedFile[i], uploadedFile[i].name);
            }
        }
        approveFormData.append('formDataJson', JSON.stringify(recallObject));
        return this._http.post(this._commonService.baseUrl + '/withdrawProposal', approveFormData);
    }

    createAwardFromProposal(params) {
        return this._http.post(this._commonService.baseUrl + '/createAwardFromProposal', params);
    }

    checkUnitRight(param) {
        return this._http.post(this._commonService.baseUrl + '/checkUnitRight', param);
    }

    deleteProposal(params) {
        return this._http.post(this._commonService.baseUrl + '/deleteProposal', params);
    }

    addImportedAttachment(proposalId, importedFile) {
        const formData = new FormData();
        for (const file of importedFile) {
            formData.append('files', file, file.name);
        }
        formData.append('formDataJson', JSON.stringify({ 'proposalId': proposalId }));
        return this._http.post(this._commonService.baseUrl + '/importProposalTemplate', formData);
    }

    loadProposalKeyPersonAttachments(params) {
        return this._http.post(this._commonService.baseUrl + '/loadProposalKeyPersonAttachments', params);
    }

    createProposalAdminCorrection(params) {
        return this._http.post(this._commonService.baseUrl + '/createProposalAdminCorrection', params);
    }

    completeProposalAdminCorrection(proposalId) {
        return this._http.patch(`${this._commonService.baseUrl}/completeProposalAdminCorrection/${proposalId}`, {},
         { observe: 'response' });
    }

    createIP(data) {
        return this._http.post(this._commonService.baseUrl + '/generateInstituteProposal', data);
    }

    loadProposalKeyPersonnelPersons(proposalId) {
        return this._http.get(`${this._commonService.baseUrl}/loadProposalKeyPersonnelPersons/${proposalId}`);
    }

    deleteKeyPersonnelAttachment(params) {
        return this._http.post(this._commonService.baseUrl + '/deleteKeyPersonnelAttachment', params);
    }

    loadPersonnelAttachTypes() {
        return this._http.get(this._commonService.baseUrl + '/loadPersonnelAttachTypes');
    }

    uploadProposalPersonAttachment(proposalPersonAttachment, uploadedFile, proposalId) {
        const formData = new FormData();
        for (const file of uploadedFile) {
            formData.append('files', file, file.fileName);
        }
        formData.append('formDataJson', JSON.stringify({
            'newPersonAttachments': proposalPersonAttachment,
            'proposalId': proposalId
        }));
        return this._http.post(this._commonService.baseUrl + '/uploadProposalPersonAttachment', formData);
    }

    updateKeyPersonnelAttachment(attachment) {
        const formData = new FormData();
        formData.append('formDataJson', JSON.stringify({
            'proposalPersonAttachment': {
                'attachmentId': attachment.attachmentId,
                'description': attachment.description, 'attachmentType': attachment.attachmentType,
                'attachmentTypeCode': attachment.attachmentTypeCode,
                'proposalPersonName': attachment.proposalPersonName,
                'proposalPersonId' : attachment.proposalPersonId
            }
        }));
        return this._http.post(this._commonService.baseUrl + '/updateKeyPersonnelAttachment', formData);
    }

    downloadProposalPersonAttachment(attachmentId) {
        return this._http.get(this._commonService.baseUrl + '/downloadProposalPersonAttachment', {
            headers: new HttpHeaders().set('attachmentId', attachmentId.toString()),
            responseType: 'blob'
        });
    }
    
    cancelAdminCorrection(params) {
        return this._http.post(this._commonService.baseUrl + '/cancelProposalAdminCorrection', params);
    }
}

