import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EntityDetailsService, LEAVE_PAGE_AND_COMPLETE } from './entity-details.service';
import { closeCommonModal, deepCloneObject, hideModal, isEmptyObject, openModal } from '../../common/utilities/custom-utilities';
import { Subscription } from 'rxjs';
import { NavigationService } from '../../common/services/navigation.service';
import { CommonService } from '../../common/services/common.service';
import { COMMON_ERROR_TOAST_MSG, FINANCIAL_DETAILS_SECTION_NAME, FINANCIAL_SUB_TYP_CODES, HTTP_ERROR_STATUS, MATRXI_FORM,
    RELATIONSHIP_QUESTIONNAIRE_SECTION_NAME, SFI_ADDITIONAL_DETAILS_SECTION_NAME, USER_DASHBOARD_CHILD_ROUTE_URLS } from '../../app-constants';
import { ViewRelationshipDetailsComponent } from './view-relationship-details/view-relationship-details.component';
import { COIValidationModalConfig, GlobalEventNotifier } from '../../common/services/coi-common.interface';
import { COIMatrix, MATRIX_TYPE, QUESTIONNAIRE_TYPE } from './engagement-interface';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { CommonModalConfig, ModalActionEvent } from '../../shared-components/common-modal/common-modal.interface';
import { InformationAndHelpTextService } from '../../common/services/informationAndHelpText.service';
import { HeaderService } from '../../common/header/header.service';
import { groupBy } from './engagment-utilities';
import { AutoSaveService } from '../../common/services/auto-save.service';
import { REVIEWER_ADMIN_DASHBOARD_ROUTE_URLS } from '../../reviewer-dashboard/reviewer-dashboard-constants';

@Component({
    selector: 'app-entity-details',
    templateUrl: './entity-details.component.html',
    styleUrls: ['./entity-details.component.scss']
})

export class EntityDetailsComponent implements OnInit, OnDestroy {
    @Input() entityId: any;
    @Output() closeAction: EventEmitter<boolean> = new EventEmitter<boolean>();

    @ViewChild(ViewRelationshipDetailsComponent) viewRelationComponent: ViewRelationshipDetailsComponent;

    isTriggeredFromSlider = false;
    $subscriptions: Subscription[] = [];
    questionnaireSection: any = '';
    relationValidationMap = new Map();
    entityNumber: any;
    isSaving = false;
    checkedRelationships = {};
    SFI_ADDITIONAL_DETAILS_SECTION_NAME = SFI_ADDITIONAL_DETAILS_SECTION_NAME;
    matrixLabel = '';
    helpTexts=`Relationship Details section, use this section to disclose financial information
    related to the entity for your Self, Spouse/Domestic Partner, and Dependents
    (children who are unemancipated and under 18 years of age or who receive more than one-­‐half support
    from you).`
    entityDetails: any;
    openQuestionnaireTimeout: any;

    constructor(public entityDetailService: EntityDetailsService, private _route: ActivatedRoute, private _router: Router,
        public commonService: CommonService, private _navigationService: NavigationService, private _autoSaveService: AutoSaveService,
        private _informationAndHelpTextService: InformationAndHelpTextService,private _headerService: HeaderService) {}

    async ngOnInit() {
        this._autoSaveService.initiateAutoSave();
        this.matrixLabel = this.commonService.isUnifiedQuestionnaireEnabled ? MATRXI_FORM : 'Financial Relationship'
        this.resetServiceValues();
        this.setActiveTab();
        this.isTriggeredFromSlider = this.checkForSFIOpenedFromSlider();
        this.getQueryParams();
        this.fetchDisclosureQuestionType();
        this.getAvailableRelationship();
        this.listenToAddRelationModal();
        this.listenToGlobalNotifier();
        this.listenToLeaveConfirmationModal();
        this.fetchMatrixComplete();
        if (!this.isTriggeredFromSlider) {
            this._informationAndHelpTextService.moduleConfiguration = this.commonService.getSectionCodeAsKeys(this._route.snapshot.data.moduleConfig);
        }
    }

    setActiveTab() {
        if (this._navigationService.previousURL.includes('travel-disclosure')) {
            const TAB: any = sessionStorage.getItem('engagementTab');
            this.entityDetailService.activeTab = TAB || 'RELATION_DETAILS';
        } else {
            this.entityDetailService.activeTab = 'RELATION_DETAILS';
        }
        sessionStorage.removeItem('engagementTab');
    }

    fetchDisclosureQuestionType(isFirstLoad = true) {
        this.entityDetailService.isNoFormType = false;
        this.entityDetailService.canShowMatrixForm = false;
        if(this.commonService.isUnifiedQuestionnaireEnabled) {
            this.$subscriptions.push(this.entityDetailService.fetchDisclosureQuestionType(this.entityId).subscribe(async (data: any) => {
                this.entityDetailService.selectedDisclosureTypes = data;
                this.viewRelationComponent.isMulptipleRelationAvailable();
                this.getAvailableRemainingRelation();
                if(data.length) {
                    const SELECTED_TYPE = this.entityDetailService.selectedDisclosureTypes.find(item => item.dataCapturingTypeCode);
                    if(SELECTED_TYPE) {
                        this.entityDetailService.currentRelationshipQuestionnaire = SELECTED_TYPE;
                        this.entityDetailService.activeRelationship = this.entityDetailService.currentRelationshipQuestionnaire.disclosureTypeCode;
                        if(this.entityDetailService.currentRelationshipQuestionnaire.dataCapturingTypeCode === MATRIX_TYPE) {
                            this.entityDetailService.canShowMatrixForm = true;
                            this.entityDetailService.activeRelationship = this.entityDetailService.currentRelationshipQuestionnaire.disclosureTypeCode;
                        } else if(!this.entityDetailService.currentRelationshipQuestionnaire.dataCapturingTypeCode) {
                            this.entityDetailService.isNoFormType = true;
                        } else if(this.entityDetailService.currentRelationshipQuestionnaire.dataCapturingTypeCode === QUESTIONNAIRE_TYPE) {
                            this.openQuestionnaire(SELECTED_TYPE);
                            if(isFirstLoad) {
                                this.entityDetailService.activeTab = 'RELATION_DETAILS';
                            }
                        }
                    }
                }
            }, err => {
                this.getAvailableRemainingRelation();
            }));
        } else {
            this.entityDetailService.isShowRelationshipDetailsTab = true;
        }
    }

    private listenToGlobalNotifier(): void {
        this.$subscriptions.push(this.commonService.$globalEventNotifier.subscribe((data: GlobalEventNotifier) => {
            if (data.uniqueId === 'UPDATE_ENGAGEMENT_VALIDATION') {
                switch (data.content.modalAction.action) {
                    case 'CLOSE_BTN':
                        this.clearModal();
                        this.commonService.closeCOIValidationModal();
                        break;
                    case 'SECONDARY_BTN': // create as cancel
                        this.clearModal();
                        this.commonService.closeCOIValidationModal();
                        break;
                    case 'PRIMARY_BTN': // mark as void and save
                        this.addRelation('MARK_AS_VOID_AND_SAVE');
                        break;
                    default: break;
                }
            }
            if(data.uniqueId === 'ENGAGEMENT_GROUP_DELETE') {
                this.getAvailableRelationship();
            }
        }));
    }

    getQueryParams() {
        this.$subscriptions.push(this._route.queryParams.subscribe(params => {
            this.entityId = params['personEntityId'] || this.entityId;
            this.entityId = parseInt(this.entityId, 10);
            this.entityNumber = params['personEntityNumber'] || null;
        }));
    }

    checkForSFIOpenedFromSlider() {
        return ['related-disclosures','create-travel-disclosure','create-disclosure', USER_DASHBOARD_CHILD_ROUTE_URLS.MY_ENGAGEMENTS_ROUTE_URL, 'disclosure/summary', 'manage-entity/', USER_DASHBOARD_CHILD_ROUTE_URLS.MY_DISCLOSURES_ROUTE_URL, 'coi/admin-dashboard', 'coi/opa', REVIEWER_ADMIN_DASHBOARD_ROUTE_URLS.DISCLOSURE_LIST].some(ele => this._router.url.includes(ele))
    }

    async getAvailableRelationship() {
        if(!this.commonService.isUnifiedQuestionnaireEnabled) {
            this.entityDetailService.allAvailableRelationships = await this.getRelationshipLookUp();
            this.entityDetailService.remainingRelationships = deepCloneObject(this.entityDetailService.allAvailableRelationships);
            this.removeExistingRelation();
        }
    }

    async getAvailableRemainingRelation() {
        const LOOKUP_TYPES = await this.loadUnifiedTypeLookups();
        this.entityDetailService.allAvailableRelationships = deepCloneObject(LOOKUP_TYPES?.coiDisclosureTypes);
        this.setRemainaingTypesForUnified();
    }

    setRemainaingTypesForUnified() {
        this.entityDetailService.remainingSelectedDisclosureTypes = this.entityDetailService.allAvailableRelationships.filter(a =>
            !this.entityDetailService.selectedDisclosureTypes.some(b => b.disclosureTypeCode === a.disclosureTypeCode));
    }

    /*
    remove already added relationships from available relationship and grouping remaining relations.
    */
    private removeExistingRelation() {
        this.entityDetailService.groupedRelations = {};
        if (this.entityDetailService.definedRelationships.length) {
            this.entityDetailService.definedRelationships.forEach(element => {
                this.findRelationAndRemove(element.validPersonEntityRelType.validPersonEntityRelTypeCode);
            });
        } else {
            if (this.entityDetailService.remainingRelationships.length) {
                this.entityDetailService.groupedRelations = groupBy(deepCloneObject(this.entityDetailService.remainingRelationships), "coiDisclosureType", "description");
            }
        }
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
        this.commonService.hasChangesAvailable = false;
        this._autoSaveService.stopAutoSaveEvent();
        if (this.openQuestionnaireTimeout) {
            clearTimeout(this.openQuestionnaireTimeout);
        }
    }

    fullPageNavigationLeavePage() {
        this.entityDetailService.navigateUrl = this._navigationService.navigationGuardUrl;
        if(this.entityDetailService.unsavedChangesSecndryBtn === LEAVE_PAGE_AND_COMPLETE) {
            this.entityDetailService.triggerFormId.next({ 'formId': this.viewRelationComponent.formId, 'engagementId': this.viewRelationComponent.entityId?.toString() });
            this.viewRelationComponent.completeEngagement();
        } else {
            this.entityDetailService.clearServiceVariable();
            this._router.navigateByUrl(this.entityDetailService.navigateUrl);
        }
        this.closeUnsavedChangesModal();
    }

    closeUnsavedChangesModal() {
        hideModal('hiddenUnsavedChanges');
    }

    listenToLeaveConfirmationModal() {
        this.$subscriptions.push(this.entityDetailService.$emitUnsavedChangesModal.subscribe((data: any) => {
            if (this.entityDetailService.isRelationshipQuestionnaireChanged) {
                const sectionName = this.commonService.isCompensatedFlow
                    ? FINANCIAL_DETAILS_SECTION_NAME
                    : RELATIONSHIP_QUESTIONNAIRE_SECTION_NAME;

                this.questionnaireSection = this.entityDetailService.unSavedSections.find(ele => ele.includes(sectionName));
                openModal('questionnaireUnsavedChanges');
            }
            if (this.entityDetailService.isAdditionalDetailsChanged || this.entityDetailService.isFormDataChanged) {
                openModal('relationDetailsUnSavedChanges');
            }
            if (this.entityDetailService.isMatrixChanged) {
                openModal('matrixUnSavedChanges');
            }
        }));
    }

    private openQuestionnaire(entityDetails: any) {
        this.entityDetailService.activeRelationship = entityDetails?.disclosureTypeCode || entityDetails?.validPersonEntityRelType?.disclosureTypeCode;
        this.entityDetailService.activeTab = 'QUESTIONNAIRE';
        const DATA_CAPTURING_TYPE_CODE = entityDetails?.dataCapturingTypeCode || entityDetails?.validPersonEntityRelType?.coiDisclosureType?.dataCapturingTypeCode
        if ( DATA_CAPTURING_TYPE_CODE === MATRIX_TYPE) {
            this.entityDetailService.canShowMatrixForm = true;
            this.entityDetailService.isNoFormType = false;
        } else {
            this.entityDetailService.isNoFormType = true;
            this.openQuestionnaireTimeout = setTimeout(() => {
                this.entityDetailService.$openQuestionnaire.next(entityDetails);
            }, 500);
        }
    }

    closeSlider(event) {
        this.closeAction.emit(false);
    }

    cancelConcurrency() {
        this.entityDetailService.concurrentUpdateAction = '';
    }

    listenToAddRelationModal() {
        this.$subscriptions.push(this.entityDetailService.$triggerAddRelationModal.subscribe(async (data: any) => {
            this.removeExistingRelation();
            if (this.entityDetailService.isRelationshipQuestionnaireChanged) {
                this.entityDetailService.globalSave$.next();
            }
            this.relationValidationMap.clear();
            this.entityDetails = data.entityDetails;
            openModal('addRelationshipModal');
        }))
    }

    private findRelationAndRemove(financialEntityRelTypeCode: string) {
        this.entityDetailService.groupedRelations = {};
        const RELATION_INDEX = this.entityDetailService.remainingRelationships.findIndex(element =>
            element.validPersonEntityRelTypeCode === financialEntityRelTypeCode);
        if (RELATION_INDEX !== -1) {
            this.entityDetailService.remainingRelationships.splice(RELATION_INDEX, 1);
        }
        if (this.entityDetailService.remainingRelationships.length) {
            this.entityDetailService.groupedRelations = groupBy(deepCloneObject(this.entityDetailService.remainingRelationships), "coiDisclosureType", "description");
        }
    }

    async loadUnifiedTypeLookups(): Promise<any> {
        try {
            return await this.entityDetailService.loadUnifiedTypeLookups();
        } catch (error) {
            this.commonService.showToast(HTTP_ERROR_STATUS, 'Something went wrong, Please try again.');
        }
    }

    async getRelationshipLookUp(): Promise<any> {
        try {
            return await this.entityDetailService.addSFILookUp();
        } catch (error) {
            this.commonService.showToast(HTTP_ERROR_STATUS, 'Something went wrong, Please try again.');
        }
    }

    async matrixLeavePage() {
        this.entityDetailService.isMatrixChanged = false;
        let index = this.entityDetailService.unSavedSections.findIndex(ele => ele.includes(this.matrixLabel));
        if (index >= 0) {
            this.entityDetailService.unSavedSections.splice(index, 1);
        }
        hideModal('matrixUnSavedChanges');
        if (this.entityDetailService.toBeActiveTab === 'HISTORY') {
            this.entityDetailService.activeTab = 'HISTORY';
        } else if(this.entityDetailService.toBeActiveTab === 'RELATED_DISCLOSURES') {
            this.entityDetailService.activeTab = 'RELATED_DISCLOSURES';
        } else if (this.entityDetailService.toBeActiveTab === 'RELATION_DETAILS') {
            this.entityDetailService.activeTab = 'RELATION_DETAILS';
            await this.viewRelationComponent.getApplicableForms();
        } else if (this.entityDetailService.isVersionChange) {
            this.viewRelationComponent.loadCurrentVersion();
            this.entityDetailService.toBeActiveTab === 'QUESTIONNAIRE';
        } else {
            this.entityDetailService.activeTab = 'QUESTIONNAIRE';
            this.entityDetailService.canShowMatrixForm = false;
            setTimeout(() => {
                this.entityDetailService.$openQuestionnaire.next(this.entityDetailService.currentRelationshipQuestionnaire);
            });
            this.entityDetailService.isNoFormType = true;
            this.entityDetailService.activeRelationship = this.entityDetailService.currentRelationshipQuestionnaire.disclosureTypeCode;
        }
        this.entityDetailService.isVersionChange = false;
        this.viewRelationComponent.updateStepsNavBtnConfig();
    }

    relationDetailsLeavePage() {
        this.entityDetailService.isAdditionalDetailsChanged = false;
        this.entityDetailService.isFormDataChanged = false;
        this.entityDetailService.canShowMatrixForm = false;
        this.entityDetailService.isNoFormType = true;
        this.entityDetailService.validationList = [];
        const INDEX = this.entityDetailService.unSavedSections.findIndex(ele => ele.includes(SFI_ADDITIONAL_DETAILS_SECTION_NAME));
        if (INDEX >= 0) {
            this.entityDetailService.unSavedSections.splice(INDEX, 1);
        }
        hideModal('relationDetailsUnSavedChanges');
        if (this.entityDetailService.toBeActiveTab === 'HISTORY') {
            this.entityDetailService.activeTab = 'HISTORY';
        } else if(this.entityDetailService.toBeActiveTab === 'RELATED_DISCLOSURES') {
            this.entityDetailService.activeTab = 'RELATED_DISCLOSURES';
        } else if (this.entityDetailService.toBeActiveTab === 'QUESTIONNAIRE') {
            if(this.commonService.isUnifiedQuestionnaireEnabled) {
                this.openQuestionnaire(!isEmptyObject(this.entityDetailService.currentRelationshipQuestionnaire) ? this.entityDetailService.currentRelationshipQuestionnaire : this.entityDetailService.selectedDisclosureTypes[0]);
            } else {
                this.openQuestionnaire(!isEmptyObject(this.entityDetailService.currentRelationshipQuestionnaire) ? this.entityDetailService.currentRelationshipQuestionnaire : this.entityDetailService.definedRelationships[0]);
            }
        } else if (this.entityDetailService.isVersionChange) {
            this.viewRelationComponent.loadCurrentVersion();
        }
        this.entityDetailService.isVersionChange = false;
        this.viewRelationComponent.updateStepsNavBtnConfig();
    }

    async questionnaireChangeModalLeaveTab() {
        this.entityDetailService.isRelationshipQuestionnaireChanged = false;
        const sectionName = this.commonService.isCompensatedFlow
            ? FINANCIAL_DETAILS_SECTION_NAME
            : RELATIONSHIP_QUESTIONNAIRE_SECTION_NAME;

        const INDEX = this.entityDetailService.unSavedSections.findIndex(ele => ele.includes(sectionName));
        if (INDEX >= 0) {
            this.entityDetailService.unSavedSections.splice(INDEX, 1);
        }
        if (this.entityDetailService.toBeActiveTab === 'RELATION_DETAILS') {
            this.entityDetailService.activeTab = 'RELATION_DETAILS';
            await this.viewRelationComponent.getApplicableForms()
        } else if (this.entityDetailService.toBeActiveTab === 'HISTORY') {
            this.entityDetailService.activeTab = 'HISTORY';
        } else if(this.entityDetailService.toBeActiveTab === 'RELATED_DISCLOSURES') {
            this.entityDetailService.activeTab = 'RELATED_DISCLOSURES';
        } else {
            this.entityDetailService.isVersionChange ? this.viewRelationComponent.loadCurrentVersion(): this.openAfterLeavePage();
            this.entityDetailService.toBeActiveTab === 'QUESTIONNAIRE';
        }
        this.entityDetailService.isVersionChange = false;
        this.viewRelationComponent.updateStepsNavBtnConfig();
        hideModal('questionnaireUnsavedChanges');
    }


    //leave page will be worked based on unified questionnaire flag, if unified flag is true,
    // then based on datacapturing type the matrix form will be loaded otherwise questionnaire will be loaded
    openAfterLeavePage() {
        if(this.commonService.isUnifiedQuestionnaireEnabled) {
            if(this.entityDetailService?.currentRelationshipQuestionnaire?.dataCapturingTypeCode === QUESTIONNAIRE_TYPE) {
                this.openQuestionnaire(this.entityDetailService?.currentRelationshipQuestionnaire);
            } else if(this.entityDetailService?.currentRelationshipQuestionnaire?.dataCapturingTypeCode === MATRIX_TYPE){
                this.entityDetailService.canShowMatrixForm = true;
                this.entityDetailService.activeRelationship = this.entityDetailService?.currentRelationshipQuestionnaire?.disclosureTypeCode;
            }
        } else {
            this.entityDetailService.activeRelationship = this.entityDetailService?.currentRelationshipQuestionnaire?.validPersonEntityRelType;
            this.openQuestionnaire(this.entityDetailService?.currentRelationshipQuestionnaire);
            this.entityDetailService.isNoFormType = true;
        }
    }

    clearModal() {
        setTimeout(() => {
            this.relationValidationMap.clear();
            this.checkedRelationships = {};
        }, 200);
    }

    private addRelation(saveType: 'SAVE' | 'MARK_AS_VOID_AND_SAVE'): void {
        if (!this.isSaving && this.validateRelationship()) {
            this.isSaving = true;
            const REQ_BODY: any = {
                'questionnaireAnsHeaderId': null,
                'personEntityId': this._route.snapshot.queryParamMap.get('personEntityId'),
            };
            this.commonService.isUnifiedQuestionnaireEnabled ? REQ_BODY['disclTypeCodes'] = this.getSelectedRelationTypeCodes().map(typeCode => Number(typeCode)):
            REQ_BODY['validPersonEntityRelTypeCodes'] = this.getSelectedRelationTypeCodes().map(typeCode => Number(typeCode));
            this.$subscriptions.push(this.entityDetailService.saveOrUpdateCoiFinancialEntityDetails(REQ_BODY).subscribe((res: any) => {
                if (saveType === 'MARK_AS_VOID_AND_SAVE') {
                    this.markProjectDisclosureAsVoid(res)
                } else {
                    this.commonService.isUnifiedQuestionnaireEnabled ? this.setAddRelationForUnified(res) : this.setAddedRelation(res);
                }
                this.isSaving = false;
            }, error => {
                this.isSaving = false;
                if (error.status === 405) {
                    hideModal('addRelationshipModal');
                    this.clearModal();
                    this.entityDetails = {};
                    this.entityDetailService.concurrentUpdateAction = 'Add Relationship';
                } else {
                    this.commonService.showToast(HTTP_ERROR_STATUS, 'Something went wrong, Please try again.');
                }
            }));
        }
    }

    private setAddedRelation(res: any): void {
        this.updateNewRelationships(res);
        hideModal('addRelationshipModal');
        this.clearModal();
        this.entityDetails = {};
    }

    private setAddRelationForUnified(data) {
        hideModal('addRelationshipModal');
        if(data?.perEntDisclTypeSelection?.length) {
            data.perEntDisclTypeSelection.forEach((ele) => {
                this.entityDetailService.perEntDisclTypeSelections?.push(ele);
            });
        }
        this.viewRelationComponent.getUnifiedPersonEntityRelationships();
        this.viewRelationComponent.setTopForStickySections();
        this.updateRelationForUnified(data);
        this.clearModal();
        this.entityDetails = {};
        this.fetchDisclosureQuestionType(false);
    }

    async updateNewRelationships(res) {
        this.entityDetailService.currentRelationshipQuestionnaire = res.personEntityRelationships[0];
       this.updateRelationForNonUnified(res);
    }

    async updateRelationForUnified(res) {
        if (this.entityId != res.personEntityId) {
            await this.viewRelationComponent.updateModifiedVersion(res, false);
            this.entityDetailService.remainingSelectedDisclosureTypes = this.entityDetailService.allAvailableRelationships.filter(a =>
                !this.entityDetailService.selectedDisclosureTypes.some(b => b.disclosureTypeCode === a.disclosureTypeCode));
        } else {
            this.openQuestionnaire(res.personEntityRelationships[0]);
            this.entityDetailService.$addOrDeleteRelation.next({'element': res.personEntityRelationships, 'isFormCompleted': res.isFormCompleted, 'updateTimestamp': res.updateTimestamp});
        }
    }

    async updateRelationForNonUnified(res) {
        if (this.entityId != res.personEntityId) {
            await this.viewRelationComponent.updateModifiedVersion(res, false);
            this.entityDetailService.definedRelationships.forEach(ele => {
                this.findRelationAndRemove(ele.validPersonEntityRelTypeCode);
            });
        } else {
            res.personEntityRelationships.forEach(ele => {
                this.entityDetailService.definedRelationships.push(ele);
                this.findRelationAndRemove(ele.validPersonEntityRelTypeCode);
            });
            // this.openQuestionnaire(res.personEntityRelationships[0]);
            this.entityDetailService.$addOrDeleteRelation.next({'element': res.personEntityRelationships, 'isFormCompleted': res.isFormCompleted, 'updateTimestamp': res.updateTimestamp});
        }
    }

    validateRelationship() {
        this.relationValidationMap.clear();
        if (!this.getSelectedRelationTypeCodes().length) {
            this.relationValidationMap.set('relationRadio', 'Please select a relation to continue.');
        }
        return this.relationValidationMap.size === 0 ? true : false;
    }

    getSelectedRelationTypeCodes() {
        return Object.keys(this.checkedRelationships).filter(key => this.checkedRelationships[key]);
    }

    resetServiceValues() {
        this.entityDetailService.activeRelationship = {};
        this.entityDetailService.definedRelationships = [];
        this.entityDetailService.allAvailableRelationships = [];
        this.entityDetailService.remainingRelationships = [];
        this.entityDetailService.relationshipCompletedObject = {};
        this.entityDetailService.currentRelationshipQuestionnaire = {};
        this.entityDetailService.canMangeSfi = false;
        this.entityDetailService.activeTab = 'RELATION_DETAILS';
        this.entityDetailService.currentVersionDetails = {};
        this.entityDetailService.groupedRelations = {};
        this.entityDetailService.formBuilderId = null;
        this.entityDetailService.validationList = [];
        this.entityDetailService.isMandatoryComponentAvailable = false;
        this.entityDetailService.isFormCompleted = false;
        this.entityDetailService.modalConfig = new CommonModalConfig(this.entityDetailService.formSavingConfirmationId, 'Stay On Page', 'Leave Page', '');
        this.entityDetailService.isShowRelationshipDetailsTab = false;
        this.entityDetailService.navigateUrl = '';
    }

    getRelationshipDetails(): any[] {
        const RELATION_DETAILS = [];
        if(this.entityDetailService.definedRelationships.length) {
            this.entityDetailService.definedRelationships.forEach((ele) => {
                RELATION_DETAILS.push(ele.validPersonEntityRelType);
            });
        }
        return RELATION_DETAILS;
    }

    /*
    * For checking whether financial relation exist
    */
    private validateFinancialRelationship (): boolean {
        return this.getSelectedRelationTypeCodes()?.some((validPersonEntityRelTypeCode: any) =>
            FINANCIAL_SUB_TYP_CODES.includes(validPersonEntityRelTypeCode)
        ) || false;
    }

    validateAddRelation(): void {
        this.addRelation('SAVE');
    }

    private openCreateConfirmationModal(): void {
        const CONFIG = new COIValidationModalConfig();
        CONFIG.triggeredFrom = 'UPDATE_ENGAGEMENT_VALIDATION';
        CONFIG.errorMsgHeader = 'Attention';
        CONFIG.validationType = 'ACTIONABLE';
        CONFIG.errorList = [this.commonService.getEngagementDisclosureVoidMessage('TO_ADD_RELATION')];
        CONFIG.modalConfig.namings.primaryBtnName = 'Confirm and Add Relationship';
        CONFIG.modalConfig.namings.secondaryBtnName = 'Cancel';
        this.commonService.openCOIValidationModal(CONFIG);
    }

    private markProjectDisclosureAsVoid(relationshipDetails: any): void {
        this.$subscriptions.push(
            this.commonService.markProjectDisclosureAsVoid()
                .subscribe((data: any) => {
                    this.setAddedRelation(relationshipDetails);
                    this.commonService.closeCOIValidationModal();
                }, (error: any) => {
                    this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
                }));
    }

    async postConfirmation(modalActions: ModalActionEvent) {
        const { modalConfig, isMandatoryComponentAvailable, activeTab, formSavingConfirmationId, isMatrixComplete } = this.entityDetailService;
        this.entityDetailService.navigateUrl = '';
        if (modalActions.action === 'PRIMARY_BTN') {
            (isMandatoryComponentAvailable || !isMatrixComplete) ? await this.viewRelationComponent.validateForm() 
                                                                 : closeCommonModal(formSavingConfirmationId);;
        } else if (modalActions.action === 'SECONDARY_BTN') {
            this.secondaryBtnAction(modalConfig);
        }
        closeCommonModal(formSavingConfirmationId);
    }

    private secondaryBtnAction(modalConfig: CommonModalConfig): void {
        if (modalConfig.namings.secondaryBtnName.includes('Complete')) {
            this.entityDetailService.navigateUrl = this._navigationService.navigationGuardUrl;
            this.viewRelationComponent.completeEngagement();
        } else {
            this.entityDetailService.isFormCompleted = true;
            this.entityDetailService.isMandatoryComponentAvailable = false;
            if (this._headerService.hasPendingMigrations && this._navigationService.navigationGuardUrl !== '/logout') {
                this._router.navigate(['/coi/migrated-engagements']);
            } else {
                this._router.navigateByUrl(this._navigationService.navigationGuardUrl);
            }
        }
    }

    private fetchMatrixComplete(): void {
         this.$subscriptions.push(this.entityDetailService.fetchMatrixJSON(this.entityId).subscribe((data: {coiMatrixResponse: COIMatrix[], matrixComplete: boolean}) => {
            this.entityDetailService.isMatrixComplete = data?.matrixComplete;
            this.entityDetailService.matrixResponse = data?.coiMatrixResponse;
        }, err => {
            this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
        }));
    }
}
