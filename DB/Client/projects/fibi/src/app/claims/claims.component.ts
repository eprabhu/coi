import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';

import { AWARD_ERR_MESSAGE, COMMON_APPROVE_LABEL, COMMON_RETURN_LABEL, DEFAULT_DATE_FORMAT, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../app-constants';
import { CommonService } from '../common/services/common.service';
import { subscriptionHandler } from '../common/utilities/subscription-handler';
import { ClaimsService } from './services/claims.service';
import { CommonDataService } from './services/common-data.service';
import { fileDownloader, setFocusToElement } from '../common/utilities/custom-utilities';
import { compareDatesWithoutTimeZone, getDateObjectFromTimeStamp, parseDateWithoutTimestamp } from '../common/utilities/date-utilities';
import { NavigationService } from '../common/services/navigation.service';
import {concatUnitNumberAndUnitName} from '../common/utilities/custom-utilities';
import { AutoSaveService } from '../common/services/auto-save.service';

declare var $: any;

@Component({
  selector: 'app-claims',
  templateUrl: './claims.component.html',
  styleUrls: ['./claims.component.css']
})
export class ClaimsComponent implements OnInit, OnDestroy {

  claimId: number = null;
  result: any = {};
  requestObject: any = {};
  isEmptyCommentArea = false;
  uploadedFile: any = [];
  attachmentWarningMsg: any;
  $subscriptions: Subscription[] = [];
  latestVersion: any;
  isShowSave = false;
  isEditMode = true;
  isModifiable = false;
  isTriggerable = false;
  isDetailsBreakdownAccessible = false;
  actionType = '';
  isManualClaim = false;
  isSaving = false; datePlaceHolder = DEFAULT_DATE_FORMAT;
  setFocusToElement = setFocusToElement;
  claimSubmissionDate = null;
  funderApprovalDate = null;
  validationObject: any = {
    moduleCode: 14,
    subModuleCode: 0,
    moduleItemKey: '',
  };
  validationMsg: any[];
  warningList: any[];
  errorList: any[];
  debounceTimer: any;
  isValidationOnlyFlag = false;
  warningFlag = false;
  redirectedFromUrl = '';
  isShowMoreOptions = false;
  removeObject: any = {};
  isClaimDelete = false;
  isClaimInfo = true;
  isClaimInfoMsg = true;
  COMMON_APPROVE_LABEL = COMMON_APPROVE_LABEL;
  COMMON_RETURN_LABEL = COMMON_RETURN_LABEL;
  concatUnitNumberAndUnitName = concatUnitNumberAndUnitName;

  constructor(private _route: ActivatedRoute, public router: Router, private _claimsService: ClaimsService,
    public _commonData: CommonDataService, public _commonService: CommonService, private _navigationService: NavigationService,
    public autoSaveService: AutoSaveService) {
    this.trackCurrentUrlChange();
  }

  ngOnInit() {
    this.redirectedFromUrl = this._navigationService.previousURL;
    this.claimId = this._route.snapshot.queryParams['claimId'];
    this.setClaimRights();
    this.getClaimGeneralData();
    this.isDurationChange();
  }

  getClaimGeneralData() {
    this.$subscriptions.push(this._commonData.$claimData.subscribe((data: any) => {
      if (data) {
        this.result = JSON.parse(JSON.stringify(data));
        this.setClaimType(this.result.claim.claimNumber);
          this.setEditMode(this.result.claim.claimStatus.claimStatusCode);
          this.isDetailsBreakdownAccessible = this.result.availableRights.includes('CLAIM_MAINTAIN_DETAILED_BREAKDOWN');
      }
    }));
  }

  async setClaimRights() {
    this.isClaimDelete = await this._commonService.checkPermissionAllowed('DELETE_CLAIM');
  }

  isDurationChange() {
    this.$subscriptions.push(this._claimsService.isDurationChangeTrigger.subscribe((data: any) => {
      if (data) {
        this.result.claim.duration = data;
      }
    }));
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
  }

  /**
   * 'D' => Manual Claims
   * 'S' => System generated Claims
   * @param claimNumber
   */
  setClaimType(claimNumber: string) {
    if (claimNumber) {
      this.isManualClaim = claimNumber.charAt(0) === 'D';
    }
  }

  /**
  * 1 = Pending
  * 2 = Revision Requested
  * 7 = Revision Requested by Funding Agency
  */
  setEditMode(claimStatusCode: string) {
    this.isModifiable = this._commonData.isClaimModifiable();
    this.isTriggerable = this._commonData.isTriggerable();
    this.isEditMode = ['1', '2', '7'].includes(claimStatusCode) && this.isModifiable;
    this.recheckShowSaveButton();
  }

  /**
   * Check to show save button in  edit mode and whether the tab is endorsement
   */
  recheckShowSaveButton() {
    this.isShowSave = (this.router.url.includes('endorsement') || this.router.url.includes('overview') ||
     this.router.url.includes('invoice/details')) && this.isEditMode;
  }

  /**
   * keeps track of which tab current on in order to show or hide endorsement save button.
   */
  trackCurrentUrlChange() {
    this.$subscriptions.push(
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.recheckShowSaveButton();
        }
      })
    );
  }

  /**
  * Sets workflow status badge w.r.t workflow status code
  * 1 = Pending
  * 2 = Revision Requested
  * 3 = Approval in progress
  * 4 = Completed
  */
  getClaimStatusCode(statusCode) {
    if (statusCode === '1' || statusCode === '2') {
      return 'info';
    } else if (statusCode === '3') {
      return 'warning';
    } else if (statusCode === '4') {
      return 'success';
    } else {
      return 'info';
    }
  }

  backToClaimListClick() {
    const route: string = ((!!this.redirectedFromUrl) && this.redirectedFromUrl.includes('award')) ?
        this.redirectedFromUrl : '/fibi/dashboard/claim-list';
    this.router.navigateByUrl(route);
  }

  approveClaims() {
    this.requestObject = {};
    this.isEmptyCommentArea = false;
    this.requestObject.actionType = 'A';
    document.getElementById('route-log-btn').click();
  }

  disapproveClaims() {
    this.isEmptyCommentArea = false;
    this.requestObject = {};
    this.requestObject.actionType = 'R';
    document.getElementById('route-log-btn').click();
  }

  deleteFromUploadedFileList(index) {
    this.uploadedFile.splice(index, 1);
  }

  /**
  * closes approve-disapprove modal
  * clear files and requestObject
  */
  closeApproveDisapproveModal() {
    $('#approveDisapproveClaimsModal').modal('hide');
    this.requestObject = {};
    this.uploadedFile = [];
  }

  /**
 * @param  {} files
 * Check file duplication ,if no duplication insert it into an array
 */
  fileDrop(files) {
    this.attachmentWarningMsg = null;
    let dupCount = 0;
    for (let index = 0; index < files.length; index++) {
      if (this.uploadedFile.find(dupFile => dupFile.name === files[index].name) != null) {
        dupCount = dupCount + 1;
        this.attachmentWarningMsg = '* ' + dupCount + ' File(s) already added';
      } else {
        this.uploadedFile.push(files[index]);
      }
    }
  }

  submitClaim() {
    if (!this.isSaving) {
      this._commonService.isShowOverlay = true;
      this.isSaving = true;
      const CLAIM_OBJECT: any = {
        'claimId': this.claimId,
        'personId': this._commonService.getCurrentUserDetail('personID'),
        'updateUser': this._commonService.getCurrentUserDetail('userName'),
        'awardNumber': this.result.claim.award.awardNumber,
        'claimNumber': this.result.claim.claimNumber,
        'claimStatusCode': this.result.claim.claimStatus.claimStatusCode,
      };
      this.$subscriptions.push(this._claimsService.submitClaim(CLAIM_OBJECT).subscribe((data: any) => {
        this.setupClaimStoreData(data);
        $('#SubmitClaimModal').modal('hide');
        if (this.result.workflow) {
          this.latestVersion = this.result.workflow.workflowSequence;
        }
        this.isSaving = false;
        this._commonService.isShowOverlay = false;
      }, err => {
        this.isSaving = false;
        this._commonService.isShowOverlay = false;
        if (err.error && err.error.errorMessage  === 'Deadlock') {
          this._commonService.showToast(HTTP_ERROR_STATUS, 'Updating claim status failed. Please try again.');
        }else if (err && err.status === 405) {
          $('#SubmitClaimModal').modal('hide');
          $('#invalidActionModal').modal('show');
        } else {
          this._commonService.showToast(HTTP_ERROR_STATUS, `Transaction is not completed due to an error.
          ${AWARD_ERR_MESSAGE}`);
        }
      }));
    }
  }


  setClaimWorFlowRequestObject() {
    this.requestObject.personId = this._commonService.getCurrentUserDetail('personID');
    this.requestObject.workFlowPersonId = this._commonService.getCurrentUserDetail('personID');
    this.requestObject.updateUser = this._commonService.getCurrentUserDetail('userName');
    this.requestObject.claimId = this.claimId;
    this.requestObject.approverStopNumber = null;
    this.requestObject.claimStatusCode = this.result.claim.claimStatus.claimStatusCode;
  }

  /** approves or disapproves claim with respect to action type and
   * set claim object, latest workflow  and show toasters w.r.t
   * response ,
   */
  maintainClaimsWorkFlow() {
    this.setClaimWorFlowRequestObject();
    this.validateReturnRequest();
    if (!this.isEmptyCommentArea && !this.isSaving) {
      this.isSaving = true;
      this._commonService.isShowOverlay = true;
      this.$subscriptions.push(this._claimsService.maintainClaimWorkFlow(this.requestObject, this.uploadedFile)
        .subscribe((data: any) => {
          this.claimWorkFlowActions(data);
          this.isSaving = false;
          this._commonService.isShowOverlay = false;
        },
          err => {
            this.closeApproveDisapproveModal();
            if (err.error && err.error.errorMessage  === 'Deadlock') {
              this._commonService.showToast(HTTP_ERROR_STATUS,
                `${COMMON_APPROVE_LABEL.toLowerCase()}/disapprove claim failed. Please try again.`);
            }else if (err && err.status === 405) {
              $('#SubmitClaimModal').modal('hide');
              $('#invalidActionModal').modal('show');
            } else {
              this._commonService.showToast(HTTP_ERROR_STATUS, `Transaction is not completed due to an error.
              ${AWARD_ERR_MESSAGE}`);
            }
            this.isSaving = false;
            this._commonService.isShowOverlay = false;
          },
          () => {
            this.showSuccessToast();
            this.closeApproveDisapproveModal();
            this.isSaving = false;
          }));
    }
  }

  /**
  * to make comments mandatory for returning in the route log is action type is R (Return)
  */
  validateReturnRequest() {
    this.isEmptyCommentArea = this.requestObject.actionType === 'R' && !this.requestObject.approveComment;
  }

  /**shows success toast based on approve or disapprove claim*/
  showSuccessToast() {
    if (this.requestObject.actionType === 'A') {
      this._commonService.showToast(HTTP_SUCCESS_STATUS, `Claim ${COMMON_APPROVE_LABEL.toLowerCase()}d successfully.`);
    } else if (this.requestObject.actionType === 'R') {
      this._commonService.showToast(HTTP_SUCCESS_STATUS, `Claim ${COMMON_RETURN_LABEL.toLowerCase()}ed successfully.`);
    }
  }

  /**shows error toast based on approve or disapprove claim*/
  showErrorToast() {
    if (this.requestObject.actionType === 'A') {
      this._commonService.showToast(HTTP_ERROR_STATUS, `Waf blocked request for
      ${COMMON_APPROVE_LABEL.toLowerCase().slice(0, -1)}ing the claim`);
    } else if (this.requestObject.actionType === 'R') {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Waf blocked request for disapproving the claim');
    }
  }

  /**
 * @param  {} data
 * actions to perform in common for both waf enabled and disabled services after getting response data
 */
  claimWorkFlowActions(data) {
    this.setupClaimStoreData(data);
    this.latestVersion = this.result.workflow.workflowSequence;
    this._claimsService.isRouteChangeTrigger.next(true);
  }

  /**
 * @param  {} data
 * setup claim common data the values that changed after the service call need to be updated into the store.
 * every service call wont have all the all the details as response so
 * we need to cherry pick the changes and update them to the store.
 */
  setupClaimStoreData(data) {
    this.result.claim = data.claim;
    this.result.workflow = data.workflow;
    this.result.workflowList = data.workflowList;
    this.result.canApproveRouting = data.canApproveRouting;
    this.result.submitUserFullName = data.submitUserFullName;
    this.result.updateTimeStamp = data.updateTimeStamp;
    this.updateClaimStoreData();
  }

  updateClaimStoreData() {
    this.result = JSON.parse(JSON.stringify(this.result));
    this._commonData.setClaimData(this.result);
  }

  /**
 * navigate to the selected path and set dataChange flag to false
 */
  navigateUsingRedirectRoute() {
    this._commonData.isClaimDataChange = false;
    this.redirectBasedOnQueryParam();
  }

  redirectBasedOnQueryParam() {
    this.router.navigateByUrl(this._navigationService.navigationGuardUrl);
  }

  /**
   * Initiate trigger while clicking save button and
   * respective service will be called in endorsement tab
   */
  saveEndorsementDetails() {
    this._commonData.$saveEndorsement.next(true);
  }

  downloadClaimExcel() {
    if (!this.isSaving) {
      this.isSaving = true;
      this.$subscriptions.push(
        this._claimsService.exportClaimReport({ 'claimId': this.claimId })
          .subscribe((data: any) => {
            const filename = 'Claim Report -' + this.result.claim.claimNumber;
            fileDownloader(data.body, filename, 'zip');
            this.isSaving = false;
          }, err => {
            this.isSaving = false;
            this._commonService.showToast(HTTP_ERROR_STATUS,
                err.error.debugMessage || 'Claim report downloading failed. Please try again.');
          }));
    }
  }

  performFOActions(actionType) {
    if (!actionType || (actionType === 'A' && !this.funderApprovalDate) || this.isSaving) { return; }
    this.isSaving = true;
    $('#FOConfirmClaimModal').modal('hide');
    const CLAIM_OBJECT: any = {
      'claimId': this.claimId,
      'claimStatusCode': this.result.claim.claimStatusCode,
      'actionType': actionType,
      'awardNumber': this.result.claim.award.awardNumber
    };
    if (actionType === 'A' || (actionType === 'T' && !this.result.claim.funderApprovalDate)) {
      CLAIM_OBJECT.funderApprovalDate = parseDateWithoutTimestamp((this.funderApprovalDate));
    }
    this.$subscriptions.push(this._claimsService.performFOActions(CLAIM_OBJECT).subscribe((data: any) => {
      if (data.status) {
        this.result.claim.claimStatus = data.claimStatus;
        this.result.claim.claimStatusCode = data.claimStatus.claimStatusCode;
        if (data.funderApprovalDate) { this.result.claim.funderApprovalDate = data.funderApprovalDate; }
        this.updateClaimStoreData();
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Claim status updated successfully');
      } else {
        const REVISION_REQUEST_ERROR = [{validationMessage:
          'A Revision Request for this claim cannot be created as the invoice is awaiting for SAP response/ Feed Admin action'}];
        this.errorList = this.validationMsg = REVISION_REQUEST_ERROR;
        $('#ValidateClaimModal').modal('show');
      }
      this.isSaving = false;
    },
      _err => {
        this.isSaving = false;
        if (_err && _err.status === 405) {
          $('#SubmitClaimModal').modal('hide');
          $('#invalidActionModal').modal('show');
        }else {
          this._commonService.showToast(HTTP_ERROR_STATUS, 'Updating claim status failed. Please try again.');
        }
      }));
  }

  validateSubmitForFundingAgency() {
    this.$subscriptions.push(this._claimsService.saveOrUpdateClaim(this.generateRequestObject(this.result.claim))
      .subscribe((res: any) => {
        $('#FOConfirmClaimModal').modal('hide');
        this.claimSubmissionDate = null;
        this.setClaimDetails(res);
        this._commonData.setClaimData(this.result);
        this.performFOActions(this.actionType);
      }, err => {
        if (err && err.status === 405) {
          $('#FOConfirmClaimModal').modal('hide');
          $('#invalidActionModal').modal('show');
        }
      }));
  }

  /**
   * generates request object for save or update claim with only original claim object i.e without claim status and award details
   * all dates are parsed from javascript timestamp to "yyyy-mm-dd" format
   * @param claimsStatus
   * @param award
   * @param originalClaimObject
   */
  generateRequestObject({ claimsStatus, award, ...originalClaimObject }: any) {
    return {
      claim: {
        ...originalClaimObject,
        claimSubmissionDate: parseDateWithoutTimestamp(this.claimSubmissionDate),
        updateUser: this._commonService.getCurrentUserDetail('userName')
      }
    };
  }

  /**
   * properties are individually updated since claim object response have different
   * OR null data on some properties than what we get from initial claim details.
   * @param claim
   */
  setClaimDetails({ claim }) {
    this.result.claim.fundingSchemeCertification1 = claim.fundingSchemeCertification1;
    this.result.claim.fundingSchemeCertification2 = claim.fundingSchemeCertification2;
    this.result.claim.fundingSchemeEndorsement = claim.fundingSchemeEndorsement;
    this.result.claim.rsoName = claim.rsoName;
    this.result.claim.rsoDesignation = claim.rsoDesignation;
    this.result.claim.rsoEmail = claim.rsoEmail;
    this.result.claim.rsoApprovalDate = claim.rsoApprovalDate;
    this.result.claim.rsoPhoneNumber = claim.rsoPhoneNumber;
    this.result.claim.foName = claim.foName;
    this.result.claim.foDesignation = claim.foDesignation;
    this.result.claim.foEmail = claim.foEmail;
    this.result.claim.foApprovalDate = claim.foApprovalDate;
    this.result.claim.foPhoneNumber = claim.foPhoneNumber;
    this.result.claim.rdoName = claim.rdoName;
    this.result.claim.rdoDesignation = claim.rdoDesignation;
    this.result.claim.rdoEmail = claim.rdoEmail;
    this.result.claim.rdoApprovalDate = claim.rdoApprovalDate;
    this.result.claim.rdoPhoneNumber = claim.rdoPhoneNumber;
    this.result.claim.claimSubmissionDate = claim.claimSubmissionDate;
    this.result.claim.auditorName = claim.auditorName;
    this.result.claim.externalAuditorName = claim.externalAuditorName;
  }


  /**
   * Function called when user clicks on Validate Claim button
   * */
  async validateClaim(validation = false): Promise<void> {
    if (this._commonData.isClaimDataChange && validation) {
      $('#claimValidatetWithoutSaveModal').modal('show');
    }  else if (this._commonData.isClaimDataChange && !validation) {
      $('#claimSubmitWithoutSaveModal').modal('show');
    } else if (!this.isSaving) {
      this.isSaving = true;
      const isValid = await this.ifInvalidClaimShowValidationModal(validation);
     if (isValid) {
        $('#SubmitClaimModal').modal('show');
     }
      this.isSaving = false;
    }
  }

  isClaimValidAgainstBusinessRule(): Promise<unknown> {
    return new Promise((resolve, reject) => {
      this.validationObject.moduleItemKey = this.claimId;
      this.validationMsg = this.claimDateValidationWarningList();
      this.warningList = [];
      this.errorList = [];
      const evaluateBusinessRule = this._commonService.evaluateValidation(this.validationObject);
      const evaluateClaimIndirectCost = this._claimsService.evaluateClaimIndirectCost(this.claimId);
      this.$subscriptions.push(forkJoin([evaluateBusinessRule, evaluateClaimIndirectCost]).subscribe((data: any) => {
        this.validationMsg = [...this.validationMsg, ...data[0], ...data[1]];
        if (this.validationMsg.length > 0) {
          this.validationMsg.forEach(element => {
            (element.validationType === 'VW') ? this.warningList.push(element) : this.errorList.push(element);
          });
        }
        if (this.validationMsg.length) {
          return resolve(false);
        }
        return resolve(true);
      },
      err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Evaluating claim failed. Please try again.');
        return reject(false);
      }));
    });
  }

  async ifInvalidClaimShowValidationModal(shouldShowAlways = false): Promise<boolean> {
    const isClaimValid = await this.isClaimValidAgainstBusinessRule();
    if (!isClaimValid || shouldShowAlways) {
      $('#ValidateClaimModal').modal('show');
      return false;
    }
    return true;
  }

  claimDateValidationWarningList() {
      if (compareDatesWithoutTimeZone(getDateObjectFromTimeStamp(this.result.claim.award.finalExpirationDate),
          this.result.claim.endDate) === -1) {
          return [{validationType: 'VW', validationMessage:
          'Claim end date exceeds award end date. Please ensure the invoice date is within the project qualifying period.'}];
      }
      return [];
  }

  async triggerInvoiceAction(): Promise<void> {
   if (this.isSaving) { return; }
     this.isSaving = true;
     const isClaimValid = await this.ifInvalidClaimShowValidationModal();
     if (isClaimValid) {
       this.populateFunderDate();
       this.openFOConfirmationModal();
     }
     this.isSaving = false;
  }

  openFOConfirmationModal(): void {
    $('#FOConfirmClaimModal').modal('show');
  }

  populateFunderDate(): void {
    this.funderApprovalDate = getDateObjectFromTimeStamp(this.result.claim.funderApprovalDate);
  }

  deleteClaimTempObject(claimId, awardId, unitNumber) {
    this.removeObject.claimId = claimId;
    this.removeObject.awardId = awardId;
    this.removeObject.unitNumber = unitNumber;
    this.removeObject.claimStatusCode = this.result.claim.claimStatus.claimStatusCode;
  }

  deleteClaim() {
    if (!this.isSaving) {
      this.isSaving = true;
        this.$subscriptions.push(this._claimsService.deleteClaimDetail(this.removeObject)
            .subscribe((data: any) => {
                if (data.status) {
                    this.backToClaimListClick();
                    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Claim deleted Successfully.');
                } else {
                    this._commonService.showToast(HTTP_ERROR_STATUS, `You don't have the right to delete this claim.`);
                }
                this.isSaving = false;
            }, err => {
              if (err && err.status === 405) {
                $('#SubmitClaimModal').modal('hide');
                $('#invalidActionModal').modal('show');
              }
              this.isSaving = false;
            }));
    }
}
  resyncClaimDetails() {
    this.$subscriptions.push(this._claimsService.resyncClaimDetails({'claimId':  this.claimId}).subscribe((data: any) => {
    this.result.claim = data.claim;
    this._commonData.setClaimData(JSON.parse(JSON.stringify(this.result)));
    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Successfully re-synced claim details.');
    }, err => {
      this._commonService.showToast(HTTP_ERROR_STATUS, 'Re-syncing claim details failed. Please try again.');
    }));
  }

  reload() {
    window.location.reload();
  }
}
