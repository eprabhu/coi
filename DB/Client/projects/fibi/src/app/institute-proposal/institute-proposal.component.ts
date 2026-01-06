/** Last updated by Aravind  on 13-01-2020 */

import { Component, OnInit, ViewChild, ElementRef, OnDestroy, HostListener, Output, EventEmitter, Input } from '@angular/core';

import { NavigationEnd, Router } from '@angular/router';
import { InstituteProposalService } from './services/institute-proposal.service';
import { subscriptionHandler } from '../common/utilities/subscription-handler';
import { Subscription } from 'rxjs';
import { CommonService } from '../common/services/common.service';
import { ActionType, BRValidation, InstituteProposal } from './institute-proposal-interfaces';
import { DataStoreService } from './services/data-store.service';
import { fileDownloader, openInNewTab } from '../common/utilities/custom-utilities';
import { concatUnitNumberAndUnitName } from '../common/utilities/custom-utilities';
import { NavigationService } from '../common/services/navigation.service';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../app-constants';
import { WebSocketService } from '../common/services/web-socket.service';
import { AutoSaveService } from '../common/services/auto-save.service';

declare var $: any;

@Component({
  selector: 'app-institute-proposal',
  templateUrl: './institute-proposal.component.html',
  styleUrls: ['./institute-proposal.component.css']
})
export class InstituteProposalComponent implements OnInit, OnDestroy {

  @Input() reviewTypes: any = {};
  @Input() specialReviewApprovalTypes: any = {};

  @ViewChild('moreOptionsBtn', { static: false }) moreOptions: ElementRef;

  @ViewChild('mainHeaders', { static: true }) mainHeaders: ElementRef;
  result = new InstituteProposal();
  $subscriptions: Subscription[] = [];
  canCreateAward = false;
  isShowMoreOptions = false;
  isShowReviewActions = false;
  currentActionType: ActionType = new ActionType();
  isSubmitEnabled = false;
  isAdminCorrectionEnabled = false;
  description = '';
  BRValidation: BRValidation = new BRValidation();
  concatUnitNumberAndUnitName = concatUnitNumberAndUnitName;
  printTemplates: any = null;
  validationMap = new Map();
  isDownloading = false;
  currentTemplateArr: any = [];
  isChecked = {};
  isModifyIp = false;
  isPendingVersionAvailable = false;
  hasDescriptionValidation = false;
  isModifyCardActive = true;
  alternateIP = null;
  blockingModificationMessage = '';
  cardMessage = '';
  isCurrentIPPending = false;
  isSaving = false;
  isShowSave = false;

  constructor(public _commonService: CommonService,
    private _router: Router,
    public _instituteService: InstituteProposalService,
    private _dataStore: DataStoreService,
    private _navigationService: NavigationService,
    public webSocket: WebSocketService,
    public autoSaveService: AutoSaveService) {
      document.addEventListener('mouseup', this.offClickHandler.bind(this));
      document.addEventListener('mouseup', this.offClickMainHeaderHandler.bind(this));
      this._router.events.subscribe((val) => {
        if (val instanceof NavigationEnd) {
          this.canShowSave();
        }
      });
  }
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
    this.result = this._instituteService.instituteProposalData.value;
    this._dataStore.setInstituteProposal(this.result);
    this.setProposalCurrentDateValues();
    this.setButtonStatus();
    this.alternateIP = this.result.instProposalSummaryVO.instProposalSummaryDetails.find(ele =>
      ele.proposalSequenceStatus === 'PENDING');
    if (this.alternateIP) {
      this.pendingVersionOwner();
    }
    this.checkForIPlock();
    this.autoSaveService.initiateAutoSave();
  }

  ngOnDestroy() {
    subscriptionHandler(this.$subscriptions);
    this.webSocket.releaseCurrentModuleLock('IP' + '#' + this.result.instProposal.proposalId);
    this.autoSaveService.stopAutoSaveEvent();
  }

  setProposalCurrentDateValues() {
    this._dataStore.currentStartDate = this.result.instProposal.startDate;
    this._dataStore.currentEndDate = this.result.instProposal.endDate;
    this._instituteService.ipTitle = this.result.instProposal.title;
  }

  canShowSave() {
    this.isShowSave = this.isEditModeAndRouteHasForms();    
  }

  isEditModeAndRouteHasForms(): boolean {
    return this.isSubmitEnabled && ['overview', 'other-information', 'budget'].some(tabName => this._router.url.includes(tabName));
  }

  setButtonStatus() {
    this.isSubmitEnabled = this.result.instProposal.proposalSequenceStatus === 'PENDING' &&
      this.result.availableRights.includes('MODIFY_INST_PROPOSAL');
    const isKey = 'IP' + '#' + this.result.instProposal.proposalId;
    if (this.isSubmitEnabled && !this.webSocket.isLockAvailable(isKey)) {
      this.isSubmitEnabled = false;
    }
    this.canCreateAward = this.result.availableRights.includes('CREATE_AWARD') &&
      this.result.instProposal.proposalSequenceStatus === 'ACTIVE';
    this.isAdminCorrectionEnabled = this.result.instProposal.proposalSequenceStatus !== 'PENDING' &&
      this.result.availableRights.includes('MODIFY_INST_PROPOSAL') && !this.result.isAwarded
      && this._commonService.isDevProposalVersioningEnabled;
    this.isModifyIp = this.result.availableRights.includes('MODIFY_INST_PROPOSAL');
    this.canShowSave();
  }

  getBadgeByStatusCode(statusCode) {
    if (statusCode === 1 || statusCode === 6) {
      return 'warning';
    } else if (statusCode === 3 || statusCode === 4 || statusCode === 5) {
      return 'danger';
    } else if (statusCode === 2) {
      return 'success';
    } else {
      return 'info';
    }
  }

  openGoBackModal() {
    this._router.navigate(['/fibi/dashboard/instituteProposalList']);
  }

  setProposalCurrentTab() {
    localStorage.setItem('currentTab', 'PROPOSAL_REVIEW');
  }

  offClickHandler(event: any) {
    if (this.moreOptions) {
      if (!this.moreOptions.nativeElement.contains(event.target)) {
        this.isShowMoreOptions = false;
        this.isShowReviewActions = false;
      }
    }
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    const HEIGHT = document.getElementById('stickyIpHeader').offsetHeight;
    const HEADER = document.getElementById('stickyIpHeader');
    if (window.pageYOffset > HEIGHT && this._commonService.isIE) {
      HEADER.classList.add('tab-sticky');
    } else {
      HEADER.classList.remove('tab-sticky');
    }
  }

  createAdminCorrection() {
    this.hasDescriptionValidation = this.description === '' ? true : false;
    if (!this.hasDescriptionValidation && !this.isSaving) {
      this.isSaving = true;
      this.$subscriptions.push(this._instituteService.createNewIPVersion({
        proposalId: this.result.instProposal.proposalId,
        description: this.description, proposalNumber: this.result.instProposal.proposalNumber
      })
        .subscribe((data: InstituteProposal) => {
          if (data.isPendingIPExist) {
            this.blockAdminCorrection(data);
          } else if (data.isArchive) {
            this.setCurrentIPArchive(data);
          } else {
            this.setAdminCorrectionActive(data);
          }
          this.isSaving = false;
        }, err => {
          this.isSaving = false;
        }));
    }
  }

  blockAdminCorrection(data) {
    this.alternateIP = data.instProposalSummaryVO.instProposalSummaryDetails.
      find(ele => ele.proposalSequenceStatus === 'PENDING');
    this.isCurrentIPPending = true;
    this.blockingModificationMessage = `Sorry, you cannot modify this Institute Proposal at this time because a
    pending version is already in progress.
    Please check back later to see if the pending version has been finalized.`;
    $('#editConfirmModal').modal('hide');
    $('#modifyIpWarningModal').modal('show');
  }

  setCurrentIPArchive(data) {
    this.description = '';
    $('#editConfirmModal').modal('hide');
    this._commonService.showToast(HTTP_ERROR_STATUS, `This Institute Proposal is currently in Archive Status.
    Cannot perform this action.`);
    this.isCurrentIPPending = false;
    this.setCardMessage('ARCHIVE');
    this.alternateIP = data.instProposalSummaryVO.instProposalSummaryDetails[0];
    this.isPendingVersionAvailable = true;
  }

  setAdminCorrectionActive(data) {
    this.blockingModificationMessage = '';
    this.editIpSection(data);
    $('#editConfirmModal').modal('hide');
  }

  changeIPStatus(): void {
    const data = {
      instituteProposalActionType: this.currentActionType,
      proposalId: this.result.instProposal.proposalId,
      description: this.description,
      proposalNumber: this.result.instProposal.proposalNumber
    };
      this.$subscriptions.push(this._instituteService.changeIpStatus(data)
      .subscribe((res: InstituteProposal) => {
        this.description = '';
        this.result.instProposal.instProposalStatus = this.currentActionType.instProposalStatus;
        this.result.instProposal.statusCode = this.currentActionType.instProposalStatus.statusCode;
        this._dataStore.updateStoreData({ 'instProposal': this.result.instProposal });
        $('#ConfirmSubmitReviewModal').modal('hide');
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Modification created successfully.');
      }, err => {
        if (err && err.status === 405) {
          $('#ConfirmSubmitReviewModal').modal('hide');
          $('#invalidActionModal').modal('show');
        } else {
          this._commonService.showToast(HTTP_ERROR_STATUS, 'Something went wrong. Please try again.');
        }
        this.canShowSave();
      }));
  }

  submitAdminCorrection() {
    if (!this.isSaving) {
      this.isSaving = true ;
      this.$subscriptions.push(this._instituteService.submitIPVersion({
        proposalId: this.result.instProposal.proposalId, description: this.description,
        proposalNumber: this.result.instProposal.proposalNumber
      }).subscribe((data: any) => {
        this.description = '';
        this.isPendingVersionAvailable = false;
        this.result.instProposal.proposalSequenceStatus = 'ACTIVE';
        this._dataStore.setInstituteProposal(this.result);
        this.setButtonStatus();
        this.isSaving = false;
        this._dataStore.dataEvent.next(Object.keys(this.result));
        this._instituteService.isInstituteProposalDataChange = false;
        this.webSocket.releaseCurrentModuleLock('IP' + '#' + this.result.instProposal.proposalId);
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Proposal submitted successfully.')
      }, err => {
        this.isSaving = false;
        if (err && err.status === 405) {
          $('#ConfirmSubmitModal').modal('hide');
          $('#invalidActionModal').modal('show');
        } else {
          this._commonService.showToast(HTTP_ERROR_STATUS, 'Submit Institute Proposal filed,Please try later.');
        }
      }));
    }
  }

  getVersionStatusCode(statusCode) {
    if (statusCode === 'ACTIVE') {
      return 'success';
    } else if (statusCode === 'PENDING') {
      return 'warning';
    } else {
      return 'info';
    }
  }

  navigateUsingRedirectRoute() {
    this._instituteService.isInstituteProposalDataChange = false;
    this.autoSaveService.clearUnsavedChanges();
    this.redirectBasedOnQueryParam();
  }

  redirectBasedOnQueryParam() {
    this._router.navigateByUrl(this._navigationService.navigationGuardUrl);
  }

  checkForUnsavedChanges() {
    if (this._instituteService.isInstituteProposalDataChange) {
      $('#ipSubmitWithoutSaveModal').modal('show');
    } else {
      this.evaluateValidation();
    }
  }

  async evaluateValidation() {
    this.BRValidation = new BRValidation();
    const validationRequest: any = {
      moduleCode: 2,
      subModuleCode: 0,
      moduleItemKey: this.result.instProposal.proposalId.toString(),
      subModuleItemKey: 0,
    };
    const data: any = await this._instituteService.evaluateValidation(validationRequest);
    if (data && data.length > 0) {
      data.forEach(M => (M.validationType === 'VW') ?
        this.BRValidation.warning.push(M) : this.BRValidation.error.push(M));
      $('#BR_MODAL').modal('show');
    } else if (!this._instituteService.isInstituteProposalDataChange) {
      $('#ConfirmSubmitModal').modal('show');
    }
    else {
      this.submitAdminCorrection();
    }
    this.autoSaveService.clearUnsavedChanges();
  }

  showDevProposals(): void {
    this.result.devProposalIds.length > 1 ? $('#devProposalListModal').modal('show') :
      this.navigateToDevProposal(this.result.devProposalIds[0]);
  }

  navigateToDevProposal(proposalId: number): void {
    openInNewTab('proposal/summary?', ['proposalId'], [proposalId]);
    this.setProposalCurrentTab();
  }

  getPrintTemplates() {
    if (this.printTemplates) {
      $('#printIPModal').modal('show');
      return null;
    }
    this.$subscriptions.push(this._instituteService.getLetterTemplates().subscribe(
      (res: any) => {
        this.printTemplates = res.data;
        $('#printIPModal').modal('show');
      }, err => {
        this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching print templates failed. Please try again.');
      }
    ));
  }

  initiateDownload() {
    if (this.currentTemplateArr.length) {
      this.printIPAsZipOrDocxOrPdf(this.currentTemplateArr.length === 1 ? this.currentTemplateArr[0].printFileType : 'zip');
    } else {
      this.validationMap.set('selectTemplate', 'Please select one template');
    }
  }

  selectedTemplates(isChecked: any, template: any) {
    if (isChecked) {
      this.currentTemplateArr.push(template);
    } else {
      const INDEX = this.currentTemplateArr.findIndex(element => element.letterTemplateTypeCode === template.letterTemplateTypeCode);
      this.currentTemplateArr.splice(INDEX, 1);
    }
  }

  printIPAsZipOrDocxOrPdf(fileType: string) {
    if (!this.isDownloading) {
      this.isDownloading = true;
      this.$subscriptions.push(this._instituteService
        .printInstituteProposal({
          'instituteProposalId': this.result.instProposal.proposalId,
          'letterTemplateTypeCodes': this.setTypeCodeArray()
        }).subscribe(
          data => {
            this.closePrintModal();
            this.parsePrintedPage(data, fileType);
            this.isDownloading = false;
          }, (err) => {
            this.closePrintModal();
            setTimeout(() => {
              this._commonService.showToast(HTTP_ERROR_STATUS, 'Printing Institute Proposal failed. Please try again.');
            }, 500);
            this.isDownloading = false;
          }
        ));
    }
  }

  setTypeCodeArray() {
    return this.currentTemplateArr.map(template => template.letterTemplateTypeCode);
  }

  parsePrintedPage(data, fileType: string) {
    const person_name = this.result.instProposal.principalInvestigator ? this.result.instProposal.principalInvestigator : null;
    const fileName = 'Institute Proposal_' + this.result.instProposal.proposalId + '_' + person_name;
    fileDownloader(data, fileName, fileType);
  }

  closePrintModal() {
    $('#printIPModal').modal('hide');
    this.currentTemplateArr = [];
    this.isChecked = {};
  }

  checkForIPlock() {
    const isKey = 'IP' + '#' + this.result.instProposal.proposalId;
    const isEdit = this.result.availableRights.includes('MODIFY_INST_PROPOSAL') &&
      this.result.instProposal.proposalSequenceStatus === 'PENDING';
    if (isEdit && !this.webSocket.isLockAvailable(isKey)) {
      this.webSocket.showModal(isKey);
      this.webSocket.getLockForModule('IP', this.result.instProposal.proposalId, this.result.instProposal.title);
    } else if (isEdit && this.webSocket.isLockAvailable(isKey)) {
      this.webSocket.getLockForModule('IP', this.result.instProposal.proposalId, this.result.instProposal.title);
    }
  }

  cancelAdminCorrection() {
    const REQ_BODY = {
      proposalId: this.result.instProposal.proposalId,
      proposalNumber: this.result.instProposal.proposalNumber
    };
    if (!this.isSaving) {
      this.isSaving = true;
      this.$subscriptions.push(this._instituteService.withdrawIP(REQ_BODY).subscribe((data: InstituteProposal) => {
        this.description = '';
        this.webSocket.releaseCurrentModuleLock('IP' + '#' + this.result.instProposal.proposalId);
        this.result = data;
        this._dataStore.setInstituteProposal(this.result);
        this.setButtonStatus();
        this.isSaving = false;
        this._dataStore.dataEvent.next(Object.keys(this.result));
        this._instituteService.isInstituteProposalDataChange = false;
        this.isPendingVersionAvailable = false;
        const activeId = this.result.instProposalSummaryVO.instProposalSummaryDetails[0].proposalId;
        this._router.navigate(['fibi/instituteproposal/overview'],
          { queryParams: { 'instituteProposalId': activeId } });
        this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Institute Proposal cancelled successfully.');
      }, (err) => {
        this.isSaving =  false;
        (err && err.status === 405) ? $('#invalidActionModal').modal('show') :
          this._commonService.showToast(HTTP_ERROR_STATUS, 'Cancel Institute Proposal failed. Please try again.');
      }));
    }
  }

  editIpSection(data) {
    this.description = '';
    this.hasDescriptionValidation = false;
    this.isPendingVersionAvailable = false;
    this.result.instProposal = data.instProposal;
    this.result.instituteProposalPersons = data.instituteProposalPersons;
    this.result.instituteProposalKeywords = data.instituteProposalKeywords;
    this.result.instituteProposalResearchAreas = data.instituteProposalResearchAreas;
    this.result.instituteProposalSpecialReviews = data.instituteProposalSpecialReviews;
    this.result.proposalId = data.proposalId;
    this.checkForIPlock();
    this._dataStore.setInstituteProposal(this.result);
    this._dataStore.dataEvent.next(Object.keys(this.result));
    this.setButtonStatus();
    this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Institute Proposal modification created successfully.');
    this._router.navigate(['fibi/instituteproposal/overview'],
      { queryParams: { 'instituteProposalId': this.result.instProposal.proposalId } });
  }

  gotoPendingIp(proposalID) {
    openInNewTab('instituteproposal/overview?', ['instituteProposalId'], [proposalID]);
  }

  pendingVersionOwner() {
    this.isPendingVersionAvailable = true;
    this.setCardMessage('PENDING');
    this.isCurrentIPPending = true;
  }

  closeModifyBlockingModal(details) {
    if (details) {
      this.isPendingVersionAvailable = true;
      this.canCreateAward = false;
      this.setCardMessage('PENDING');
      this.isCurrentIPPending = true;
    }
  }

  createNewAward(instProposal) {
    this._instituteService.getIPVersionsDetails
      ({ leadUnitNumber: instProposal.unit.unitNumber, proposalNumber: instProposal.proposalNumber }).subscribe((res: any) => {
        this.alternateIP = res.instProposalSummaryDetails.find(ele => ele.proposalSequenceStatus === 'ACTIVE');
        const isCurrentIPActive = res.instProposalSummaryDetails.length === 1 && this.alternateIP.proposalId === instProposal.proposalId;
        if (isCurrentIPActive) {
          this.blockingModificationMessage = '';
          this._router.navigate(['/fibi/award/overview'], {
            queryParams: { 'instituteProposalId': instProposal.proposalId }
          });
        } else {
          if (this.alternateIP.proposalId === instProposal.proposalId) {
            this.alternateIP = res.instProposalSummaryDetails.find(ele => ele.proposalSequenceStatus === 'PENDING');
            this.isCurrentIPPending = true;
            this.blockingModificationMessage = `Sorry, you cannot link this Institute Proposal to an Award at this time
             because a pending version is already in progress.
             Please finalize the Institute Proposal before linking.`;
            $('#modifyIpWarningModal').modal('show');
          } else {
            this.isPendingVersionAvailable = true;
            this.setCardMessage('ARCHIVE');
            this.description = '';
            this.isCurrentIPPending = false;
            this._commonService.showToast(HTTP_ERROR_STATUS,
              'This Institute Proposal is currently in Archive Status. Cannot perform this action.');
          }
        }
      });
  }

  setCardMessage(status) {
    if (status === 'ARCHIVE') {
      this.cardMessage = 'Current Active version of this Institute Proposal.';
    } else {
      this.cardMessage = 'In progress Modification associated with this Institute Proposal.';
    }
  }

  reload() {
    window.location.reload();
  }

  initiateSaveInChildComponents() {
    this.autoSaveService.commonSaveTrigger$.next(true);
  }

}
