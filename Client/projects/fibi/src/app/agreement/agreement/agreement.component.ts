import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AgreementCommonDataService } from '../agreement-common-data.service';
import { forkJoin, Subscription } from 'rxjs';
import { AgreementService } from '../agreement.service';
import { HTTP_SUCCESS_STATUS, HTTP_ERROR_STATUS, COMMON_APPROVE_LABEL,COMMON_RETURN_LABEL, AWARD_ERR_MESSAGE } from '../../app-constants';

import { CommonService } from '../../common/services/common.service';
import { AutoSaveService } from '../../common/services/auto-save.service';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { DashboardService } from '../../dashboard/dashboard.service';
import { getDateObjectFromTimeStamp } from '../../common/utilities/date-utilities';
import { environment } from '../../../environments/environment';
import { NavigationService } from '../../common/services/navigation.service';
declare var $: any;

@Component({
  selector: 'app-agreement',
  templateUrl: './agreement.component.html',
  styleUrls: ['./agreement.component.css']
})
export class AgreementComponent implements OnInit, OnDestroy {

  @ViewChild('moreOptions', { static: false }) moreOptions: ElementRef;

  result: any = {};
  $subscriptions: Subscription[] = [];
  isNegotiation = false;
  isShowMoreOptions = false;
  isShowSubOptions = false;
  isShowNotificationModal = false;
  generateAgreementObject: any = {};
  reviewType = '';
  isReviewPending: any;
  finalizeAgreementObject: any = { newAttachments: [] };
  uploadedFile: any = [];
  isSubmitAgreement = false;
  isFinalWarning: string;
  isGeneratedBtnClick = false;
  reviewObject: any = {
    agreementNote: {}
  };
  completeReviewObject: any = {
    agreementNote: {}
  };
  submitAgreementObject: any = {
    agreementNote: {}
  };
  isAgreementAdministrator = false;
  isGroupAdministrator = false;
  readyToExecuteObject: any = {
    agreementNote: {}
  };
  isModalOpen = true;
  latestVersion: any = null;
  isGenerateAgreement = false;
  modalApproveHeading: any;
  warningMessageObject: any = {};
  requestObject: any = {};
  isShowApproveDisapproveButton = false;
  validationObject: any = {};
  isShowSubmitButton = false;
  isShowReturnToPI = false;
  isShowReviewCommentsButton = false;
  isShowCompleteReviewButton = false;
  isShowStartReviewButton = false;
  isShowReadyToExecuteButton = false;
  isShowTransferOption = false;
  isShowTerminateOption = false;
  isShowAbandonOption = false;
  isShowReopenButton = false;
  isShowFianlizeOption = false;
  isShowGenerateDocumentButton = false;
  assignObject: any = {
    agreementPeople: {}, agreementNote: {}
  };
  adminSearchOptions: any = {};
  adminGroupSearchOptions: any = {};
  assignAdminMap = new Map();
  clearField;
  clearAdminGroupField;
  roleType;
  isRoleTypeChanged = false;
  isExistAgreementAdmin = false;
  isTransfer = false;
  isTerminate = false;
  isAbandon = false;
  terminalActionObject: any = {
    agreementNote: { 'note': null }
  };
  isAssigntoMe = false;
  isShowMore = false;
  isTerminals = false;
  locationTypeCode: string;
  isShowAgreementActions = false;
  isShowReviewActions = false;
  isShowOtherActions = false;
  negotiationLookup: any;
  activityTypeCode: any;
  negotiationLocationId: any;
  clearModalValue: any = true;
  deployMap = environment.deployUrl;
  clickedOption: any;
  isShowWarningMessage = false;
  warningMessage: any;
  isShowAddAttachmentModal = false;
  isShowActivityModal = false;
  isShowDeleteButton = false;
  isSaving = false;
  @ViewChild('mainHeaders', { static: true }) mainHeaders: ElementRef;

  constructor(public _autoSaveService: AutoSaveService, private _route: ActivatedRoute,
    public _commonAgreementData: AgreementCommonDataService,
    private _agreementService: AgreementService, public _commonService: CommonService,
    private _router: Router, public _dashboardService: DashboardService, private _navigationService: NavigationService
  ) { document.addEventListener('mouseup', this.offClickHandler.bind(this));
  document.addEventListener('mouseup', this.offClickMainHeaderHandler.bind(this)); }

   // The function is used for closing nav dropdown at mobile screen
   offClickMainHeaderHandler(event: any) {
    if (window.innerWidth < 992) {
      const ELEMENT = <HTMLInputElement>document.getElementById('navbarResponsive');
      if (!this.mainHeaders.nativeElement.contains(event.target)) {
        if (ELEMENT.classList.contains('show')) {
          document.getElementById('responsiveColapse').click();
        }
      }
    }
  }
  ngOnInit() {
    this.result = this._route.snapshot.data.agreementDetails;
    this.setCommonDateValues();
    this.updateAgreementStoreData();
    this.getAgreementGeneralData();
    this.loadNegotiationData();
    this.checkForAdmin();
    this.checkForNegotiationLookUp();
    this.routerEventSubscription();
  }

  setCommonDateValues() {
    this._commonAgreementData.startDate = this.result.agreementHeader.startDate;
    this._commonAgreementData.endDate = this.result.agreementHeader.endDate;
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  checkForNegotiationLookUp() {
    this._agreementService.$getNegotiationLookUp.subscribe((data) => {
      this.negotiationLookup = data;
    });
  }

  loadNegotiationData() {
    this.$subscriptions.push(this._agreementService.loadAgreementNegotiation(
      {
        'agreementRequestId': this.result.agreementHeader.agreementRequestId,
        'negotiationId': this.result.agreementHeader.negotiationId
      }).subscribe((data: any) => {
        this.negotiationLookup = data;
        this._agreementService.$getNegotiationLookUp.next(this.negotiationLookup);
      }));
  }

  updateAgreementStoreData() {
    this.result = JSON.parse(JSON.stringify(this.result));
    this._commonAgreementData.setAgreementData(this.result);
  }

  setCompleterOptions(result: any) {
    this.adminSearchOptions.defaultValue = '';
    this.adminSearchOptions.arrayList = result.persons;
    this.adminSearchOptions.contextField = 'fullName';
    this.adminSearchOptions.filterFields = 'fullName';
    this.adminSearchOptions.formatString = 'fullName';
  }

  setAdminGroupCompleterOptions(result: any) {
    this.adminGroupSearchOptions.defaultValue = '';
    this.adminGroupSearchOptions.arrayList = result.agreementAdminGroups;
    this.adminGroupSearchOptions.contextField = 'adminGroupName';
    this.adminGroupSearchOptions.filterFields = 'adminGroupName';
    this.adminGroupSearchOptions.formatString = 'adminGroupName';
  }

  getAgreementGeneralData() {
    this.$subscriptions.push(this._commonAgreementData.$agreementData.subscribe((data: any) => {
      if (data) {
        this.result = JSON.parse(JSON.stringify(data));
        this.getPermissions();
        this.showRequiredActionButtons();
        this.checkForSaveButton();
        this.switchOnTerminals();
        this.checkForAdmin();
      }
      this.setCompleterOptions(this.result);
      this.setAdminGroupCompleterOptions(this.result);
    }));
  }

  /** Returns true if the gives right is in the list of available rights. */
  getPermissions() {
    this.isAgreementAdministrator = this.result.availableRights.includes('AGREEMENT_ADMINISTRATOR');
    this.isSubmitAgreement = this.result.availableRights.includes('SUBMIT_AGREEMENT');
    this.isGenerateAgreement = this.result.availableRights.includes('GENERATE_DOCUMENT');
    this.isGroupAdministrator = this.result.availableRights.includes('VIEW_ADMIN_GROUP_AGREEMENT');
  }

  /** Shows action buttons in their respective statuses. */
  showRequiredActionButtons() {
    this.isShowApproveDisapproveButton = this.showApproveDisapprove();
    this.isShowSubmitButton = this.checkForSubmitButton();
    this.isShowReturnToPI = this.checkForReturnToPiButton();
    this.isShowReviewCommentsButton = this.checkForReviewCommentsButton();
    this.isShowReadyToExecuteButton = this.checkForReadyToExecuteButton();
    this.isShowTransferOption = this.checkForTransferOption();
    this.isShowTerminateOption = this.checkForTerminateOption();
    this.isShowAbandonOption = this.checkForAbandonOption();
    this.isShowFianlizeOption = this.checkForFinalizeOption();
    this.isShowReopenButton = this.checkForReopenOption();
    this.isShowGenerateDocumentButton = this.checkForGenerateDocumentButton();
    this.isShowDeleteButton = this.checkForDeleteButton();
  }

  checkForDeleteButton() {
    return (this.result.agreementHeader.agreementStatusCode === '1' &&
      (this.result.availableRights.includes('DELETE_AGREEMENT') ||
      this.result.agreementHeader.requestorPersonId === this._commonService.getCurrentUserDetail('personID')));
  }

  /** Conditions for showing approve or disapprove button. */
  showApproveDisapprove() {
    return this.result && this.result.canApproveRouting === '1' &&
      this.result.agreementHeader.agreementStatusCode === '5' ? true : false;
  }

  /** Conditions for showing 'Submit Agreement' button.*/
  checkForSubmitButton() {
    return this.result.agreementHeader.agreementRequestId && ['1', '6'].includes(this.result.agreementHeader.agreementStatusCode)
      && (this.isSubmitAgreement || this.checkRequesterId() ||
       this.checkForPI() || this.isAgreementAdministrator || this.isGroupAdministrator);
  }

  /** returns true if the requestorPersonId matches with person id of currently login user.*/
  checkRequesterId() {
    return (this.result.agreementHeader.requestorPersonId === this._commonService.getCurrentUserDetail('personID')) ? true : false;
  }

  checkForPI() {
    const PI = this.result.agreementPeoples.find(person => person.peopleTypeId === 3);
    return PI && PI.personId === this._commonService.getCurrentUserDetail('personID') ? true : false;
  }

  /** Conditions for showing 'Return to PI' in more options.*/
  checkForReturnToPiButton() {
    return (this.result.agreementHeader.agreementStatusCode === '2' &&
      (this.getWorkFlowPermission() || this.result.agreementHeader.workflowStatusCode == null) ||
      this.result.agreementHeader.agreementStatusCode === '3' ||
      this.result.agreementHeader.agreementStatusCode === '5' ||
      this.result.agreementHeader.agreementStatusCode === '7')
      && (this.isAgreementAdministrator || this.isGroupAdministrator);
  }

  /** Conditions for showing 'Review comments' button.*/
  checkForReviewCommentsButton() {
    return ((this.result.agreementHeader.agreementRequestId &&
      this.getCompleteReviewPermission()) || this.isAgreementAdministrator || this.isGroupAdministrator
      || this.result.isUserHaveReview === true) &&
      (this.result.agreementHeader.agreementStatusCode !== '3' && this.result.agreementHeader.agreementStatusCode !== '4' &&
        this.result.agreementHeader.agreementStatusCode !== '8' && this.result.agreementHeader.agreementStatusCode !== '9' &&
        this.result.agreementHeader.agreementStatusCode !== '10');
  }

  /** Conditions for showing 'Complete Review' button.*/
  checkForCompleteReviewButton() {
    return this.result.agreementHeader.agreementRequestId && this.getCompleteReviewPermission() &&
      (this.result.agreementHeader.agreementStatusCode !== '3' && this.result.agreementHeader.agreementStatusCode !== '4' &&
        this.result.agreementHeader.agreementStatusCode !== '8' && this.result.agreementHeader.agreementStatusCode !== '9' &&
        this.result.agreementHeader.agreementStatusCode !== '10');
  }

  /** Conditions for showing 'Ready To Execute' button.*/
  checkForReadyToExecuteButton() {
    return this.result.agreementHeader.agreementRequestId &&
      (this.result.agreementHeader.agreementStatusCode === '2')
      && (this.isAgreementAdministrator || this.isGroupAdministrator);
  }

  /** Determines the visibility of common save button. */
  checkForSaveButton() {
    if (this.result.agreementHeader.agreementRequestId &&
      this._navigationService.currentURL.includes('/fibi/agreement/form')) {
      this._commonAgreementData.isShowSaveButton = this.result.sectionCodes && Object.keys(this.result.sectionCodes).length ?
        true : this._commonAgreementData.getSectionEditPermission();
    } else {
      this._commonAgreementData.isShowSaveButton = false;
    }
  }

  routerEventSubscription() {
    this.$subscriptions.push(this._router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.checkForSaveButton();
      }
    }));
  }

  checkForGenerateDocumentButton() {
    return this.isGenerateAgreement && this.result.agreementHeader.agreementStatusCode !== '4' &&
      this.result.agreementHeader.agreementStatusCode !== '8' && this.result.agreementHeader.agreementStatusCode !== '9' &&
      this.result.agreementHeader.agreementStatusCode !== '10' &&
       this.result.agreementHeader.agreementStatusCode !== '7' && this.result.agreementHeader.agreementStatusCode !== '1'
      && this.result.agreementHeader.adminPersonId;
  }


  /** Determines the visibility of Transfer, Terminate and Abandon option in More Options.
   * agreementStatusCode = '2' -> Review in progress, agreementStatusCode = '3'-> Executable
   * agreementStatusCode = '4' -> Final & Executed, agreementStatusCode = '8' -> Transferred
   * agreementStatusCode = '9' -> Terminated, agreementStatusCode = '10' -> Abandoned
  */
  checkForTransferOption() {
    return ['2', '3', '4', '9', '10'].includes(this.result.agreementHeader.agreementStatus.agreementStatusCode);
  }

  checkForTerminateOption() {
    return ['2', '3', '4', '8', '10'].includes(this.result.agreementHeader.agreementStatus.agreementStatusCode);
  }

  checkForAbandonOption() {
    return ['2', '3', '4', '8', '9'].includes(this.result.agreementHeader.agreementStatus.agreementStatusCode);
  }

  checkForReopenOption() {
    return ['4', '8', '9', '10'].includes(this.result.agreementHeader.agreementStatus.agreementStatusCode);
  }

  checkForFinalizeOption() {
    return ['2', '3'].includes(this.result.agreementHeader.agreementStatus.agreementStatusCode);
  }

  /**
  * @param  {any} event
  * Hide more option dropdown on clicking
  */
  offClickHandler(event: any) {
    if (this.moreOptions) {
      if (!this.moreOptions.nativeElement.contains(event.target)) {
        this.isShowMoreOptions = false;
      }
    }
  }

  /**
  * @param  {} statusCode
  * Sets agreement status badge w.r.t status code
  */
  getBadgeByStatusCode(statusCode) {
    if (statusCode === '1') {
      return 'info';
    } else if (statusCode === '2') {
      return 'warning';
    } else if (statusCode === '3') {
      return 'success';
    } else {
      return 'info';
    }
  }

  /**
  * @param  {} statusCode
  * Sets workflow status badge w.r.t workflow status code.
  */
  getWorkFlowStatusCode(statusCode) {
    return (statusCode === '1' || statusCode === '2' || statusCode === '3') ? 'warning' : 'success';
  }

  /** Preparing object for generating document.*/
  setObjectForDocumentGeneration() {
    this.generateAgreementObject.agreementTypeCode = this.result.agreementHeader.agreementTypeCode;
    this.generateAgreementObject.agreementType = this.result.agreementHeader.agreementType.description;
    this.generateAgreementObject.updateUser = this._commonService.getCurrentUserDetail('userName');
    this.generateAgreementObject.isAgreementCreatedOnce = this.result.isAgreementCreatedOnce ? this.result.isAgreementCreatedOnce : false;
    this.generateAgreementObject.agreementRequestId = this.result.agreementHeader.agreementRequestId;
  }

  generateAgreement() {
    this.setObjectForDocumentGeneration();
    this.$subscriptions.push(this._agreementService.generateAgreement(this.generateAgreementObject)
      .subscribe((data: any) => {
        (!data.message) ? this.getGeneratedDocumentDetails(data) :
          this._commonService.showToast(HTTP_ERROR_STATUS, data.message);
        this.isModalOpen = false;
        this.generateAgreementObject = {};
      },
        err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Generating Agreement action failed. Please try again.'); }));
  }

  getGeneratedDocumentDetails(data: any) {
    if (this.isGeneratedBtnClick) {
      this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Document generated successfully');
    }
    this.result.agreementAttachments = data.agreementAttachments;
    this.result.isAgreementCreatedOnce = data.isAgreementCreatedOnce;
    this.result.agreementComments = data.agreementComments;
    this.setDatesFromTimeStamp();
    this.updateAgreementStoreData();
    this.isGeneratedBtnClick = false;
  }

  triggerSubmitModal() {
		if (this._commonAgreementData.isAgreementDataChange) {
			$('#confirm-agreement-save-submit-modal').modal('show');
		} else {
			this.triggerValidation();
		}
	}

	triggerValidation() {
		if (this.agreementValidation()) {
			this.invokeBusinessRule();
		} else if (this._commonAgreementData.isAgreementDataChange) {
				this._commonService.showToast(HTTP_ERROR_STATUS, 'Please save the changes before submit', 5000);
		} else {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Please fill all mandatory fields', 5000);
    }
	}

	invokeBusinessRule() {
		this.validationObject.errorList = [];
		this.validationObject.warningList = [];
		const REQUEST_OBJECT: any = {
			moduleCode: 13,
			subModuleCode: 0,
			moduleItemKey: this.result.agreementHeader.agreementRequestId,
		};
		if (!this.isSaving) {
			this.isSaving = true;
			this.$subscriptions.push(forkJoin(this._commonService.evaluateValidation(REQUEST_OBJECT),
           this._agreementService.getApplicableQuestionnaire(this.getQuestionnaireRequestObject())).subscribe(async (data: any) => {
				this.validationObject.validationMsg = data[0];
        this.setQuestionnaireValidationMsg(data[1].applicableQuestionnaire);
        this._commonService.isManualLoaderOn = true;
				this.isSaving = false;
				this.setValidationObject();
			}, err => {
        this.isSaving = false;
        this._commonService.isManualLoaderOn = false;
      }));
		}
	}

	getQuestionnaireRequestObject(): any {
		const REQUEST_OBJECT = {
			'moduleSubItemCode': this.result.agreementHeader.agreementTypeCode,
			'moduleSubItemKey': 0,
			'moduleItemCode': 13,
			'moduleItemKey': this.result.agreementHeader.agreementRequestId,
			'actionUserId': this._commonService.getCurrentUserDetail('personID'),
			'actionPersonName': this._commonService.getCurrentUserDetail('userName')
		};
		return REQUEST_OBJECT;
	}

  setQuestionnaireValidationMsg(allQuestionnaireList) {
    const unAnsweredQuestionnaireList = [];
    if (allQuestionnaireList.length) {
      allQuestionnaireList.forEach(element => {
        if (element.IS_MANDATORY === 'Y' && (element.QUESTIONNAIRE_COMPLETED_FLAG === 'N' || element.QUESTIONNAIRE_COMPLETED_FLAG == null)) {
          unAnsweredQuestionnaireList.push(element.QUESTIONNAIRE_LABEL || element.QUESTIONNAIRE);
        }
      });
    }
    if (unAnsweredQuestionnaireList.length) {
      const element = {
        validationType: 'VE', validationMessage: 'Please complete the following mandatory questionnaire(s) in the "Questionnaire" section.'
          + this.getIncompleteQuestionnaireList(unAnsweredQuestionnaireList)
      };
      this.validationObject.validationMsg.push(element);
    }
  }

  getIncompleteQuestionnaireList(list): string {
    let incompleteQuestionnaires = '<ol>';
    list.forEach(element => { incompleteQuestionnaires += `<li> ${element} </li>`; });
    return incompleteQuestionnaires + '</ol>';
  }

  /** Validates agreement before submit. */
  validatesBeforeAction() {
    if (!this._commonAgreementData.isAgreementDataChange) {
      this.validationObject.errorList = [];
      this.validationObject.warningList = [];
      const REQUEST_OBJECT: any = {
        moduleCode: 13,
        subModuleCode: 0,
        moduleItemKey: this.result.agreementHeader.agreementRequestId,
      };
      if (!this.isSaving) {
        this.isSaving = true;
        this.$subscriptions.push(this._commonService.evaluateValidation(REQUEST_OBJECT).subscribe((data: any) => {
          this.validationObject.validationMsg = data;
          this.isSaving = false;
          this.setValidationObject();
        }, err => { this.isSaving = false; }));
      }
    } else {
      $('#confirm-agreement-save-submit-modal').modal('show');
    }
  }

  continueToSubmit() {
    this.validationObject = {};
    this.validationObject.validationMsg = [];
    $('#agreement-validation-modal').modal('hide');
    if (this.result.agreementHeader.agreementStatusCode === '2' || this.result.agreementHeader.agreementStatusCode === '3') {
      this.clickedOption === 'Execute' ? this.setReadyToExecute() : $('#finalizeActionModal').modal('show');
    } else if (this.result.agreementHeader.agreementStatusCode === '1' || this.result.agreementHeader.agreementStatusCode === '6') {
      $('#confirm-agreement-submit-modal').modal('show');
    }
  }

  /**
   * groups validation messages as error and warning list
   * If there is validation message, then shows validation modal other wise shows submit modal.
   */
  setValidationObject() {
    if (this.validationObject.validationMsg.length > 0) {
      this.validationObject.validationMsg.forEach(element => {
        (element.validationType === 'VW') ?
          this.validationObject.warningList.push(element) : this.validationObject.errorList.push(element);
      });
    }
    if (this.validationObject.validationMsg.length) {
      this._commonService.isManualLoaderOn = false;
      $('#agreement-validation-modal').modal('show');
    } else if (this.clickedOption === 'Execute') {
      this._commonService.isManualLoaderOn = false;
      this.setReadyToExecute();
    } else if (this.clickedOption === 'Finalize') {
      this._commonService.isManualLoaderOn = false;
      $('#finalizeActionModal').modal('show');
    } else if (this.clickedOption === 'Submit' && this._commonAgreementData.isAgreementDataChange) {
      this.submitAgreement();
    } else {
      this._commonService.isManualLoaderOn = false;
      $('#confirm-agreement-submit-modal').modal('show');
    }
  }

  triggerValidationPopup() {
    if (this.validationObject.validationMsg.length) {
      $('#agreement-validation-modal').modal('show');
    } else if (this.result.agreementHeader.agreementStatusCode === '2') {
      this.setReadyToExecute();
    } else if (this.result.agreementHeader.agreementStatusCode === '3') {
      $('#finalizeActionModal').modal('show');
    } else {
      $('#confirm-agreement-submit-modal').modal('show');
    }
  }

  setReadyToExecute() {
    this.checkPendingReview();
    $('#confirm-execute-modal').modal('show');
  }

  /** Preparing object for submitting agreement */
  setObjectForAgreementSubmission() {
    this.submitAgreementObject.agreementRequestId = this.result.agreementHeader.agreementRequestId;
    this.submitAgreementObject.updateUser = this._commonService.getCurrentUserDetail('userName');
    this.submitAgreementObject.agreementNote.agreementRequestId = this.result.agreementHeader.agreementRequestId;
    this.submitAgreementObject.agreementNote.updateUser = this._commonService.getCurrentUserDetail('userName');
    this.submitAgreementObject.personId = this._commonService.getCurrentUserDetail('personID');
  }

  /** submit agreement to change its status to approval in progress */
  submitAgreement() {
    if (this.agreementValidation()) {
      this.setObjectForAgreementSubmission();
      this.getDataAfterSubmission();
    } else {
      this.initiateSaveInChildComponents();
    }
  }

  getDataAfterSubmission() {
    this.$subscriptions.push(this._agreementService.submitAgreement(this.submitAgreementObject)
      .subscribe((data: any) => {
        this.setUpAgreementData(data);
        this.result = data;
        this.result.sectionCodes = data.sectionCodes;
        this.readyToExecuteObject.agreementNote.note = '';
        this.setDatesFromTimeStamp();
        this.result.agreementHeader = data.agreementHeader;
        this._commonAgreementData.isAgreementDataChange = false;
        this.updateAgreementStoreData();
        this._commonAgreementData.isAgreementDataChange = false;
        this._commonService.isManualLoaderOn = false;
        this._autoSaveService.clearUnsavedChanges();
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Agreement submitted successfully.');
      },
        err => {
          if (err.error && err.error.errorMessage  === 'Deadlock') {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Submitting Agreement failed. Please try again.');            
          } else {
            this._commonService.showToast(HTTP_ERROR_STATUS, `Transaction is not completed due to an error.
            ${AWARD_ERR_MESSAGE}`);
          }
          this._commonService.isManualLoaderOn = false;
         },
      ));
  }

  /** Preparing object for completing review. */
  setObjectForReviewCompletion() {
    this.completeReviewObject.agreementRequestId = this.result.agreementHeader.agreementRequestId;
    this.completeReviewObject.negotiationId = this.result.agreementHeader.negotiationId;
    this.completeReviewObject.personId = this._commonService.getCurrentUserDetail('personID');
    this.completeReviewObject.updateUser = this._commonService.getCurrentUserDetail('userName');
    this.completeReviewObject.agreementNote.agreementRequestId = this.result.agreementHeader.agreementRequestId;
    this.completeReviewObject.agreementNote.updateUser = this._commonService.getCurrentUserDetail('userName');
  }

  /** Preparing object for submitting review. */
  setObjectForReviewSubmission() {
    this.reviewObject.agreementRequestId = this.result.agreementHeader.agreementRequestId;
    this.reviewObject.negotiationId = this.result.agreementHeader.negotiationId;
    this.reviewObject.updateUser = this._commonService.getCurrentUserDetail('userName');
    this.reviewObject.agreementNote.agreementRequestId = this.result.agreementHeader.agreementRequestId;
    this.reviewObject.agreementNote.updateUser = this._commonService.getCurrentUserDetail('userName');
  }

  setReviewTypeCode() {
    this.result.agreementReviewTypes.forEach(element => {
      if (element.description === this.reviewType) {
        this.reviewObject.agreementReviewTypeCode = element.agreementReviewTypeCode;
      }
    });
  }

  submitForReview() {
    this.setObjectForReviewSubmission();
    this.setReviewTypeCode();
    this.$subscriptions.push(this._agreementService.submitAgreementReview(this.reviewObject)
      .subscribe((data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Agreement submitted successfully.');
        this.result.agreementHeader = data.agreementHeader;
        this.result.agreementComments = data.agreementComments;
        this.reviewObject.agreementNote.note = null;
        this.isModalOpen = false;
        this.setDatesFromTimeStamp();
        this.updateAgreementStoreData();
      },
        err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Submitting Review action failed. Please try again.'); }));
  }

  /**
  * @param  {} event
  *  updating isShowNotificationModal flag after sending agreement notification.
  */
  showAgreementNotificationModal(event) {
    this.isShowNotificationModal = event;
  }

  /** Preparing object for executing agreement. */
  setObjectForAgreementExecution() {
    this.readyToExecuteObject.updateUser = this._commonService.getCurrentUserDetail('userName');
    this.readyToExecuteObject.agreementRequestId = this.result.agreementHeader.agreementRequestId;
    this.readyToExecuteObject.agreementNote.agreementRequestId = this.result.agreementHeader.agreementRequestId;
    this.readyToExecuteObject.agreementNote.updateUser = this._commonService.getCurrentUserDetail('userName');
    this.readyToExecuteObject.personId = this._commonService.getCurrentUserDetail('personID');
  }

  readyToExecute() {
    this.setObjectForAgreementExecution();
    this.$subscriptions.push(this._agreementService.readyToExecute(this.readyToExecuteObject)
      .subscribe((data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Agreement is ready for execution.');
        this.result.agreementHeader = data.agreementHeader;
        this.result.agreementComments = data.agreementComments;
        this.result.sectionCodes = data.sectionCodes;
        this.updateAgreementStoreData();
      },
        err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Execute Agreement action failed. Please try again.'); }));
  }

  /** returns isReviewPending = true if any of the negotiation contains status code as '1' or '2'. */
  checkPendingReview() {
    this.isReviewPending = this.result.negotiationsLocations.find(location =>
      location.locationStatusCode === '2' || location.locationStatusCode === '1'
    );
  }

  /** Preparing object for finalizing agreement. */
  setObjectForAgreementFinalization() {
    this.finalizeAgreementObject.updateUser = this._commonService.getCurrentUserDetail('userName');
    this.finalizeAgreementObject.agreementRequestId = this.result.agreementHeader.agreementRequestId;
  }

  finalizeAgreement() {
    this.latestVersion = this.getTemplateLatestVersion();
    this.setObjectForAgreementFinalization();
    if (this.uploadedFile.length > 0) {
      this.updateAttachmentList();
      this.setNewAttachments();
    }
    this.checkFinalizePermission() ? this.getFinalizedAgreementDetails() :
      this.isFinalWarning = 'Please attach and mark the final contract document.';
  }

  getFinalizedAgreementDetails() {
    this.isFinalWarning = null;
    this.$subscriptions.push(this._agreementService.finalizeAgreement(this.finalizeAgreementObject, this.uploadedFile)
      .subscribe((data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Agreement has been finalized.');
        this.result.agreementHeader = data.agreementHeader;
        this.result.agreementAttachments = data.agreementAttachments;
        this.result.sectionCodes = data.sectionCodes;
        this.finalizeAgreementObject = { newAttachments: [] };
        this.uploadedFile = [];
        this.updateAgreementStoreData();
        document.getElementById('agreement-finalize-dismiss-btn').click();
      }, err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Finalize Agreement action failed. Please try again.'); }));
  }

  updateAttachmentList() {
    if (this.finalizeAgreementObject.isFinal) {
      this.uploadedFile[0].agreementAttachStatusCode = 'C';
    }
    this.result.agreementAttachments = this.result.agreementAttachments.concat(this.uploadedFile);
  }

  setNewAttachments() {
    const tempObjectForAdd: any = {};
    tempObjectForAdd.agreementAttachmentTypeCode = '4';
    tempObjectForAdd.agreementAttachmentId = this.latestVersion ? this.latestVersion.agreementAttachmentId : null;
    tempObjectForAdd.fileName = this.uploadedFile[0].name;
    tempObjectForAdd.agreementAttachStatusCode = 'C';
    tempObjectForAdd.updateTimestamp = new Date().getTime();
    tempObjectForAdd.updateUser = this._commonService.getCurrentUserDetail('userName');
    this.finalizeAgreementObject.newAttachments[0] = tempObjectForAdd;
    this.finalizeAgreementObject.isGeneratedAgreement = true;
  }

  checkFinalizePermission() {
    const latestTemplateVersion = this.getTemplateLatestVersion();
    if (latestTemplateVersion) {
      return latestTemplateVersion.agreementAttachStatusCode === 'C' ? true : false;
    } else {
      return false;
    }
  }

  getTemplateLatestVersion() {
    if (this.result.agreementAttachments && this.result.agreementAttachments.length) {
      return this.result.agreementAttachments.reduce((first, second) =>
        first.versionNumber > second.versionNumber ? first : second);
    }
  }

  fileDropEvent(files) {
    if (files.length) {
      this.uploadedFile = [];
      this.uploadedFile.push(files[0]);
    }
  }

  deleteFromUploadedFileList(index) {
    this.uploadedFile.splice(index, 1);
  }

  /** Checks permissions for submitting to 3rd party, Legal or HOD. */
  checkForSubmitPermission() {
    return this.result.agreementHeader.agreementStatusCode === '2' &&
     (this.isAgreementAdministrator || this.isGroupAdministrator) ? true : false;
  }

  getWorkFlowPermission() {
    return this.result.agreementReviewTypes.length ? true : false;
  }

  getCompleteReviewPermission() {
    if (this.result.agreementHeader.workflowStatusCode === '1') {
      return this.result.availableRights.includes('COMPLETE_THIRD_PARTY_REVIEW') ? true : this.getLocationPermission();
    } else if (this.result.agreementHeader.workflowStatusCode === '2') {
      return this.result.availableRights.includes('COMPLETE_LEGAL_REVIEW') ? true : this.getLocationPermission();
    } else if (this.result.agreementHeader.workflowStatusCode === '3') {
      return this.result.availableRights.includes('COMPLETE_HOD_REVIEW') ? true : this.getLocationPermission();
    } else {
      return this.getLocationPermission() ? true : false;
    }
  }

  getLocationPermission() {
    return this.result.negotiationsLocations.find((el: any) => {
      return el.locationStatusCode === '2' && el.assigneePersonId === this._commonService.getCurrentUserDetail('personID');
    });
  }

  getReadyToExecutePermission() {
    return ['1', '2', '3', '9', '10', '11', '12', '13'].includes(this.result.agreementHeader.workflowStatusCode) ? false : true;
  }

  navigateUsingRedirectRoute() {
    this._commonAgreementData.isAgreementDataChange = false;
    this.redirectBasedOnQueryParam();
  }

  redirectBasedOnQueryParam() {
    this._router.navigateByUrl(this._navigationService.navigationGuardUrl);
  }

  submitModalOpen() {
    document.getElementById('submit-agreement').click();
  }

  getPendingLocations() {
    return Array.from(new Set(this.result.negotiationsLocations.filter(location => {
      return location.locationStatusCode === '2' || location.locationStatusCode === '1';
    }).map((location) => {
      return location.negotiationsLocationType.description;
    })));
  }

  copyAgreement() {
    const copyRequestObject = {
      'agreementRequestId': this.result.agreementHeader.agreementRequestId,
      'updateUser': this._commonService.getCurrentUserDetail('userName')
    };
    this.$subscriptions.push(this._agreementService.copyAgreement(copyRequestObject).subscribe((data: any) => {
      this.result = data;
      this.isAssigntoMe = false;
      this.setDatesFromTimeStamp();
      this.updateAgreementStoreData();
      this.loadNegotiationData();
      this._commonAgreementData.isShowSaveButton = true;
      this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Agreement copied successfully.');
      this._router.navigate(['fibi/agreement/form'],
        { queryParams: { agreementId: data.agreementHeader.agreementRequestId } });
    }, err => {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Copy Agreement action failed. Please try again.');
    }));
  }

  setDatesFromTimeStamp() {
    this.result.agreementHeader.startDate = getDateObjectFromTimeStamp(this.result.agreementHeader.startDate);
    this.result.agreementHeader.endDate = getDateObjectFromTimeStamp(this.result.agreementHeader.endDate);
  }

  /** approves or disapproves agreement with respect to action type and
  * set agreement object, latest workflow  and show toasters w.r.t
  * response
  */
  maintainAgreementWorkFlow() {
    this.setAgreementWorFlowRequestObject();
    if (!this.validateReturnRequest()) {
      this.$subscriptions.push(this._agreementService.maintainAgreementWorkFlow
        (this.requestObject, this.uploadedFile).subscribe((data: any) => {
          this._commonAgreementData.setAgreementData(data);
          if (this.requestObject.actionType === 'A') {
            this._commonService.showToast(HTTP_SUCCESS_STATUS, `Agreement ${COMMON_APPROVE_LABEL.toLowerCase()}d successfully.`);
          } else if (this.requestObject.actionType === 'R') {
            this._commonService.showToast(HTTP_SUCCESS_STATUS, `Agreement ${COMMON_RETURN_LABEL.toLowerCase()}ed successfully.`);
          }
          this.closeApproveDisapproveModal();
        },
          err => {
              if (err.error && err.error.errorMessage  === 'Deadlock') {
                this._commonService.showToast(HTTP_ERROR_STATUS,
                `${COMMON_APPROVE_LABEL.toLowerCase()}/${COMMON_RETURN_LABEL.toLowerCase()} action failed as another transaction is being processed in current agreement. Please click ${COMMON_APPROVE_LABEL.toLowerCase()}/${COMMON_RETURN_LABEL.toLowerCase()} again.`);            
              } else {
                this._commonService.showToast(HTTP_ERROR_STATUS, `Transaction is not completed due to an error.
                ${AWARD_ERR_MESSAGE}`);
              }
           
            this.closeApproveDisapproveModal();
          }));
    }
  }

  /** After an agreement gets submitted, the admin should have a provision to return the agreement to the PI.
   *  Hence the status will also gets changed to 'Revision Requested'.
   */
  returnToPI() {
    const showCommentObject: any = {
      'agreementRequestId': this.result.agreementHeader.agreementRequestId,
      'comment': this.requestObject.approveComment,
      'updateUser': this._commonService.getCurrentUserDetail('userName'),
      'personId': this._commonService.getCurrentUserDetail('personID')
    };
    this.$subscriptions.push(this._agreementService.returnAgreement(showCommentObject, this.uploadedFile).subscribe((data: any) => {
      this.setUpAgreementData(data);
      this.setDatesFromTimeStamp();
      this.result.agreementHeader = data.agreementHeader;
      this.updateAgreementStoreData();
      this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Agreement returned successfully.');
      this.closeReturnToPiModal();
    },
      err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Return agreement action failed. Please try again.');
        this.closeReturnToPiModal();
      }));
  }

  setUpAgreementData(data) {
    this.result.agreementHeader = data.agreementHeader;
    this.checkForAdmin();
    this.result.agreementComments = data.agreementComments;
    this.result.availableRights = data.availableRights;
  }

  approveAgreement() {
    this.requestObject = {};
    this.warningMessageObject.isEmptyCommentArea = false;
    this.modalApproveHeading = COMMON_APPROVE_LABEL;
    this.requestObject.actionType = 'A';
    document.getElementById(this.returnConfirmModalButtonId()).click();
  }

  disapproveAgreement() {
    document.getElementById(this.returnConfirmModalButtonId()).click();
    this.warningMessageObject.isEmptyCommentArea = false;
    this.requestObject = {};
    this.modalApproveHeading = 'Return';
    this.requestObject.actionType = 'R';
  }

  setAgreementWorFlowRequestObject() {
    this.requestObject.personId = this._commonService.getCurrentUserDetail('personID');
    this.requestObject.workFlowPersonId = this._commonService.getCurrentUserDetail('personID');
    this.requestObject.updateUser = this._commonService.getCurrentUserDetail('userName');
    this.requestObject.agreementRequestId = this.result.agreementHeader.agreementRequestId;
    this.requestObject.approverStopNumber = null;
  }

  /** method to trigger approve/return actions from confirmation modal of actions without saving  */
  onApproveOrReturnWithoutSave() {
    this._commonAgreementData.isAgreementDataChange = false;
    if (this.modalApproveHeading === COMMON_APPROVE_LABEL) {
      this.approveAgreement();
    } else if (this.modalApproveHeading === 'Return') {
      this.disapproveAgreement();
    }
  }

  /**
  * closes approve-disapprove modal
  * clear files and requestObject
  */
  closeApproveDisapproveModal() {
    $('#approveDisapproveAgreementModal').modal('hide');
    this.requestObject = {};
    this.uploadedFile = [];
  }

  closeReturnToPiModal() {
    $('#returnToPiModal').modal('hide');
    this.requestObject = {};
    this.uploadedFile = [];
  }

  /** to make comments mandatory for returning in the route log. */
  validateReturnRequest() {
    return this.warningMessageObject.isEmptyCommentArea = this.requestObject.actionType === 'R' && !this.requestObject.approveComment;
  }

  /* returns button id which triggers corresponding modal (whether warning or approve/disapprove)*/
  returnConfirmModalButtonId() {
    return this._commonAgreementData.isAgreementDataChange ? 'agreementApproveWithoutBtn' : 'agreementApproveBtn';
  }

  fileDropApproveOrReturn(files) {
    this.warningMessageObject.attachmentWarningMsg = null;
    let dupCount = 0;
    for (let index = 0; index < files.length; index++) {
      if (this.uploadedFile.find(dupFile => dupFile.name === files[index].name) != null) {
        dupCount = dupCount + 1;
        this.warningMessageObject.attachmentWarningMsg = '* ' + dupCount + ' File(s) already added';
      } else {
        this.uploadedFile.push(files[index]);
      }
    }
  }

  documentPreview() {
    const previewObject = {
      'agreementRequestId': this.result.agreementHeader.agreementRequestId,
      'agreementTypeCode': this.result.agreementHeader.agreementType.agreementTypeCode,
      'versionNumber': null
    };
    this._agreementService.previewAgreementDocument(previewObject).subscribe((data: any) => {
      const blob = new window.Blob([data], { type: 'application/pdf' });
      if (blob) {
        const a = document.createElement('a');
        a.target = '_blank';
        a.href = URL.createObjectURL(blob);
        a.click();
        a.remove();
      }
    });
  }
  agreementValidation() {
    let validation = true;
    if (!this.result.agreementHeader.agreementStatusCode ||
      this.result.agreementHeader.agreementStatusCode === 'null') {
      validation = false;
    }
    if (!this.result.agreementHeader.agreementTypeCode ||
      this.result.agreementHeader.agreementTypeCode === 'null') {
      validation = false;
    }
    if (!this.result.agreementHeader.categoryCode ||
      this.result.agreementHeader.categoryCode === 'null') {
      validation = false;
    }
    if (!this.result.agreementHeader.title) {
      validation = false;
    }
    if (!this.result.agreementHeader.startDate) {
      validation = false;
    }
    if (!this.result.agreementHeader.endDate) {
      validation = false;
    }
    if (!this.result.agreementHeader.unitNumber) {
      validation = false;
    }
    if (this.result.agreementHeader.startDate && this.result.agreementHeader.endDate) {
      const START_DATE = new Date(this.result.agreementHeader.startDate);
      const END_DATE = new Date(this.result.agreementHeader.endDate);
      if (START_DATE > END_DATE) {
        validation = false;
      }
    }
    return validation;
  }

  /**
   * this initiates the save trigger on the autoSave service which in place
   * initiates the save on all child components who have subscribed into this event
   */
  initiateSaveInChildComponents() {
    this._autoSaveService.commonSaveTrigger$.next(true);
  }

  /**To export entire agreement*/
  exportAgreement() {
    this._agreementService.exportAgreement(this.result.agreementHeader.agreementRequestId).subscribe((data: any) => {
      this.parsePrintedPage(data, 'Export');
    });
  }

  /**To print agreement summary*/
  generateAgreementSummary() {
    this._agreementService.generateAgreementSummary(this.result.agreementHeader.agreementRequestId).subscribe((data: any) => {
      this.parsePrintedPage(data, 'Print');
    });
  }

  /**To download files */
  parsePrintedPage(data, type) {
    const tempData: any = data || {};
    if ((window.navigator as any).msSaveOrOpenBlob) {
      this.downloadAgreementBasedOnType(data, type);
    } else {
      const printElement = document.createElement('a');
      document.body.appendChild(printElement);
      printElement.href = URL.createObjectURL(tempData);
      printElement.download = type === 'Export' ?
        'Agreement_Summary_#' + this.result.agreementHeader.agreementRequestId + '.zip' :
        'Agreement_Summary_#' + this.result.agreementHeader.agreementRequestId + '.pdf';
      printElement.click();
    }
  }

  /**Download as zip file when exported
   * Download as pdf when printed
   */
  downloadAgreementBasedOnType(data: any, type: string) {
    if (type === 'Export') {
      (window.navigator as any).msSaveBlob(new Blob([data], { type: 'application/octet-stream' }),
      'Agreement_Summary_#' + this.result.agreementHeader.agreementRequestId + '.zip');
    } else {
      (window.navigator as any).msSaveBlob(new Blob([data], { type: 'application/pdf' }),
      'Agreement_Summary_#' + this.result.agreementHeader.agreementRequestId + '.pdf');
    }
  }

  /**
   * check whether admin and admin group already avialable,
   * if there is admin and admin group, then set default admin and admin group values.
   */
  checkForAdmin() {
    let assignedPerson: any;
    this.assignAdminMap.clear();
    if (this.result.agreementHeader.adminPersonId) {
      this.isExistAgreementAdmin = true;
      assignedPerson = this.result.persons.find(person => person.personId === this.result.agreementHeader.adminPersonId);
      if (assignedPerson) {
        this.adminSearchOptions.defaultValue = this.result.agreementHeader.adminName;
        this.setAssignAdminObject(assignedPerson);
      }
      this.clearField = new String('false');
      this.isAssigntoMe = this.result.agreementHeader.adminPersonId === this._commonService.getCurrentUserDetail('personID') ? true : false;
    }
    if (this.result.agreementHeader.agreementAdminGroup !== null) {
      this.adminGroupSearchOptions.defaultValue = this.result.agreementHeader.agreementAdminGroup.adminGroupName;
      this.clearAdminGroupField = new String('false');
      this.assignObject.adminGroupId = this.result.agreementHeader.adminGroupId ? this.result.agreementHeader.adminGroupId : null;
    }
  }

  setRoleTypeDropdown() {
    this.assignObject.agreementPeople.piPersonnelTypeCode = null;
    this.assignObject.agreementPeople.updateUser = this._commonService.getCurrentUserDetail('userName');
    this.assignObject.loginUserName = this._commonService.getCurrentUserDetail('userName');
    this.assignObject.updateUser = this._commonService.getCurrentUserDetail('userName');
  }

  /**
   * @param  {any} event
   * Set objects after selecting an admin from search field,
   * if admin value is cleared, then value from
   * both admin and admingroup will be removed.
   */
  adminSelectFunction(event: any) {
    if (event) {
      this.getAdminGroupDetails(event.personId);
      this.setAssignAdminObject(event);
      this.isAssigntoMe = this.setAssginToMeCheckBox();
      this.assignAdminMap.clear();
    } else {
      this.assignObject.agreementPeople.personId = null;
      this.assignObject.adminGroupId = null;
      this.isAssigntoMe = false;
      this.clearAdminGroupField = new String('true');
      this.isShowWarningMessage = false;
    }
  }

  setAssginToMeCheckBox() {
    return this.assignObject.agreementPeople.personId === this._commonService.getCurrentUserDetail('personID') ? true : false;
  }

  clearAssignFields() {
    this.clearField = new String('true');
    this.clearAdminGroupField = new String('true');
    this.assignObject.agreementPeople.personId = null;
    this.assignAdminMap.clear();
    this.isShowWarningMessage = false;
  }

  /**
   * set adminGroupId based on the selected group,
   * if admin group field is cleared then value from
   * both admin and admingroup will be removed.
   */
  adminGroupSelectFunction(event) {
    if (event) {
      this.isShowWarningMessage = false;
      this.assignObject.adminGroupId = event.adminGroupId;
    } else {
      this.assignObject.adminGroupId = null;
    }
  }

  /**
   * @param  {any} checkBoxEvent
   * Sets objects for assigning admin if user selects the checkbox 'Assign to me' from the modal.
   */
  assignToMeEvent(checkBoxEvent: any) {
    if (checkBoxEvent.target.checked) {
      this.isAssigntoMe = true;
      this.adminSearchOptions.defaultValue = this._commonService.getCurrentUserDetail('fullName');
      this.clearField = new String('false');
      this.getAdminGroupDetails(this._commonService.getCurrentUserDetail('personID'));
      this.setDetailsForAssignedToMe();
      this.assignAdminMap.clear();
    } else {
      this.clearField = new String('true');
      this.adminSearchOptions.defaultValue = '';
      this.clearAdminGroupField = new String('true');
      this.adminGroupSearchOptions.defaultValue = '';
      this.assignObject.agreementPeople = {};
      this.isAssigntoMe = false;
      this.isShowWarningMessage = false;
    }
  }

  /**
   * @param personId
   * get admin group details of selected admin,
   * if no admin group is available then flag
   * for showing warning message will be set to true.
   */
  getAdminGroupDetails(personId) {
    this.$subscriptions.push(this._agreementService.getPersonGroup(personId).subscribe((data: any) => {
      if (data.adminGroupId) {
        this.adminGroupSearchOptions.defaultValue = data.adminGroupName;
        this.clearAdminGroupField = new String('false');
        this.assignObject.adminGroupId = data.adminGroupId;
        this.isShowWarningMessage = false;
      } else {
        this.isShowWarningMessage = true;
        this.warningMessage = data;
        this.clearAdminGroupField = new String('true');
        this.adminGroupSearchOptions.defaultValue = '';
        this.assignObject.adminGroupId = null;
      }
    },
      err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching admin group details failed. Please try again.'); }
    ));
  }

  setDetailsForAssignedToMe() {
    this.assignObject.agreementPeople.personId = this._commonService.getCurrentUserDetail('personID');
    this.assignObject.personId = this._commonService.getCurrentUserDetail('personID');
    this.assignObject.loginUserName = this._commonService.getCurrentUserDetail('userName');
    this.assignObject.agreementPeople.fullName = this._commonService.getCurrentUserDetail('fullName');
  }

  /** Set agreementPeopleType object with value STO by default, otherwise set object with value as per the dropdown selection. */
  setPeopleTypeObject() {
    this.assignObject.agreementPeople.agreementPeopleType = this.isRoleTypeChanged ? this.getPeopleTypeObject(this.roleType) :
      this.getPeopleTypeObject(6);
    this.assignObject.agreementPeople.peopleTypeId = this.isRoleTypeChanged ? this.roleType : '6';
    this.assignObject.updateUser = this._commonService.getCurrentUserDetail('userName');
  }

  getPeopleTypeObject(roleType) {
    return this.result.agreementPeopleType.find(element => element.peopleTypeId === roleType);
  }

  validateAdmin() {
    this.assignAdminMap.clear();
    if (!this.assignObject.agreementPeople.personId) {
      this.assignAdminMap.set('adminName', 'adminName');
    }
    return this.assignAdminMap.size > 0 ? false : true;
  }

  assignToAgreementAdmin() {
    if (this.validateAdmin()) {
      this.assignObject.loginUserId = this._commonService.getCurrentUserDetail('personID');
      this.assignObject.agreementPeople.agreementRequestId = this.result.agreementHeader.agreementRequestId;
      this.assignObject.agreementRequestId = this.result.agreementHeader.agreementRequestId;
      this.setRoleTypeDropdown();
      this.assignAgreementAdmin();
      if (this.assignAdminMap.size === 0) {
        $('#assign-to-admin-modal').modal('hide');
      }
    }
  }

  /**
   * admin and admin group will be assigned and result will be updated
   * with new values
   */
  assignAgreementAdmin() {
    this.$subscriptions.push(this._agreementService.assignAgreementAdmin(this.assignObject).subscribe(
      (data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Admin assigned successfully.');
        this.result.agreementHeader = data.agreementHeader;
        this.result.agreementPeoples = data.agreementPeoples;
        this.result.agreementStatuses = data.agreementStatuses;
        this.clearAssignFields();
        this.isAssigntoMe = false;
        this.isShowWarningMessage = false;
        this.result.isAgreementCreatedOnce = data.isAgreementCreatedOnce;
        this.updateAgreementStoreData();
      }, err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Admin assign failed.');
      }));
  }

  setTerminalActionObject() {
    this.terminalActionObject.agreementNote.agreementRequestId = this.result.agreementHeader.agreementRequestId;
    this.terminalActionObject.agreementNote.updateUser = this._commonService.getCurrentUserDetail('userName');
    this.terminalActionObject.personId = this._commonService.getCurrentUserDetail('personID');
    this.terminalActionObject.agreementRequestId = this.result.agreementHeader.agreementRequestId;
    this.terminalActionObject.updateUser = this._commonService.getCurrentUserDetail('userName');
  }

  updateValuesWithResponse(data: any) {
    this.result.agreementHeader = data.agreementHeader;
    this.result.agreementComments = data.agreementComments;
    this.result.sectionCodes = data.sectionCodes;
    this.result.isAgreementCreatedOnce = data.isAgreementCreatedOnce;
    this.result.agreementPeoples = data.agreementPeoples;
    this.result.agreementAssociationDetails = data.agreementAssociationDetails;
    this.updateAgreementStoreData();
  }

  transferAgreement() {
    this.setTerminalActionObject();
    this.$subscriptions.push(this._agreementService.transferAgreement(this.terminalActionObject)
      .subscribe((data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Agreement transferred successfully.');
        this.result.agreementAttachments = data.agreementAttachments;
        this.updateValuesWithResponse(data);
        this.isTransfer = false;
      },
        err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Transfer Agreement action failed. Please try again.'); }));
  }

  terminateAgreement() {
    this.setTerminalActionObject();
    this.$subscriptions.push(this._agreementService.terminateAgreement(this.terminalActionObject)
      .subscribe((data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Agreement Terminated successfully');
        this.result.agreementAttachments = data.agreementAttachments;
        this.updateValuesWithResponse(data);
        this.isTerminate = false;
      },
        err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Terminate Agreement action failed. Please try again.'); }));
  }

  abandonAgreement() {
    this.setTerminalActionObject();
    this.$subscriptions.push(this._agreementService.abandonAgreement(this.terminalActionObject)
      .subscribe((data: any) => {
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Agreement abandoned successfully.');
        this.result.agreementAttachments = data.agreementAttachments;
        this.updateValuesWithResponse(data);
        this.isAbandon = false;
      },
        err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Abandon Agreement action failed. Please try again.'); }));
  }

  /**
   * @param event
   * set admin person details in assignObject.
   */
  setAssignAdminObject(person) {
    this.assignObject.agreementPeople.personId = person.personId;
    this.assignObject.agreementPeople.fullName = person.fullName ? person.fullName : null;
    this.assignObject.agreementPeople.phoneNumber = person.mobileNumber ? person.mobileNumber : null;
    this.assignObject.agreementPeople.email = person.emailAddress ? person.emailAddress : null;
    this.assignObject.agreementPeople.department = person.unit ? person.unit.unitName : null;
    this.assignObject.personId = person.personId;
  }

  /**
   * check whether the admin and admin group values changed,
   * if changed then agreement will be reopened with new admin values
   * otherwise already available values will be used.
   */
  reOpenAgreement() {
    this.setAdditionalReopenObjects();
    this.assignObject.loginUserId = this._commonService.getCurrentUserDetail('personID');
    this.setRoleType();
    this.reopenAgreementAndUpdateValues();
  }

  /**
   * agreement will be reopened and updated with new values
   */
  reopenAgreementAndUpdateValues() {
    if (this.validate()) {
      this.$subscriptions.push(this._agreementService.reopenAgreement(this.assignObject)
        .subscribe((data: any) => {
          this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Agreement reopened successfully.');
          this.closeReopenModal();
          this.updateValuesWithResponse(data);
          this.assignObject.agreementPeople = {};
        },
          err => { this._commonService.showToast(HTTP_ERROR_STATUS, 'Reopen Agreement action failed. Please try again.'); }));
    }
  }

  setAdditionalReopenObjects() {
    this.assignObject.agreementNote.agreementRequestId = this.result.agreementHeader.agreementRequestId;
    this.assignObject.agreementNote.updateUser = this._commonService.getCurrentUserDetail('userName');
    this.assignObject.agreementPeople.agreementRequestId = this.result.agreementHeader.agreementRequestId;
    this.assignObject.agreementRequestId = this.result.agreementHeader.agreementRequestId;
  }

  setRoleType() {
    this.assignObject.agreementPeople.piPersonnelTypeCode = null;
    this.assignObject.agreementPeople.updateUser = this._commonService.getCurrentUserDetail('userName');
    this.assignObject.updateUser = this._commonService.getCurrentUserDetail('userName');
    this.assignObject.loginUserName = this._commonService.getCurrentUserDetail('userName');
  }

  validate() {
    this.assignAdminMap.clear();
    if (!this.assignObject.agreementPeople.personId) {
      this.assignAdminMap.set('adminRequired', 'adminRequired');
    }
    return this.assignAdminMap.size > 0 ? false : true;
  }

  clearAllReopenFields() {
    this.assignObject.agreementNote.note = null;
    this.roleType = null;
    this.assignAdminMap.clear();
  }

  closeReopenModal() {
    $('#reOpen-agreement').modal('hide');
    this.isAssigntoMe = false;
  }

  terminalActions() {
    this.isTransfer ? this.transferAgreement() : this.isTerminate ? this.terminateAgreement() : this.abandonAgreement();
  }

  resetTerminalActionFlags() {
    this.isTransfer ? this.isTransfer = false : this.isTerminate ? this.isTerminate = false : this.isAbandon = false;
  }

  switchOnTerminals() {
    this.isTerminals = ['3', '4', '8', '9', '10'].includes(this.result.agreementHeader.agreementStatusCode) ? true : false;
  }

  updateNegotiationActivity(event) {
    if (event) {
      this._agreementService.$isActivityAdded.next(true);
      this.isShowActivityModal = event.showModal;
    }
  }

  updateAddedAttachments(event) {
    this.updateAgreementStoreData();
    this.isShowAddAttachmentModal = event.isShowAddAttachmentModal;
  }

  deleteAgreement() {
    this._agreementService.deleteAgreementRecord(this.result.agreementHeader.agreementRequestId).subscribe((data: any) => {
      if (data === 'Agreement Deleted Successfully') {
        this._commonService.showToast(HTTP_SUCCESS_STATUS,'Agreement deleted successfully.' );
        this._router.navigate(['/fibi/dashboard/agreementsList']);
      } else {
        this._commonService.showToast(HTTP_ERROR_STATUS, data);
      }
    }, err => {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Delete Agreement action failed. Please try again.');
    });
  }
}
