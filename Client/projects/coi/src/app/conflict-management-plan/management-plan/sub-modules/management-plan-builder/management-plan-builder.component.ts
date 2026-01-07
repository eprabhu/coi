import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedComponentModule } from '../../../../shared-components/shared-component.module';
import { SharedModule } from '../../../../shared/shared.module';
import { ManagementPlanActionType, ManagementPlanService } from '../../services/management-plan.service';
import { ManagementPlanDataStoreService } from '../../services/management-plan-data-store.service';
import {
    ManagementPlanStoreData, CmpBuilderSection, CmpBuilderModalConfig, CmpBuilderComponent,
    CmpBuilderModalType, CmpHeader, CmpBuilderSectionHistory, CmpBuilderRecipient,
    CmpBuilder,
    CmpRecipientConfig,
    CmpBuilderRecipientRO,
    CmpBuilderComponentRO,
    CmpBuilderSectionRO,
    CmpRecipientFieldsType,
    CmpBuilderData,
    CmpBuilderType,
} from '../../../shared/management-plan.interface';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { closeCommonModal, deepCloneObject, openCommonModal } from '../../../../common/utilities/custom-utilities';
import { DataStoreEvent, ElasticPersonSource, GlobalEventNotifier } from '../../../../common/services/coi-common.interface';
import { forkJoin, Subject, Subscription } from 'rxjs';
import { CommonService } from '../../../../common/services/common.service';
import { CommonModalConfig, ModalActionEvent } from '../../../../shared-components/common-modal/common-modal.interface';
import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from '../../../../app-constants';
import { switchMap } from 'rxjs/operators';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { AutoSaveService } from '../../../../common/services/auto-save.service';
import { compareObject } from '../../../../common/utilities/object-compare';
import { CMP_LOCALIZE } from '../../../../app-locales';
import { ElasticConfigService } from '../../../../common/services/elastic-config.service';
import { setPersonObjectFromElasticResult } from '../../../../common/utilities/elastic-utilities';
import { FetchReviewCommentRO } from 'projects/coi/src/app/shared-components/coi-review-comments-slider/coi-review-comments-slider.interface';
import { CMP_COMPONENT_COMMENTS, CMP_RECIPIENT_COMMENTS, CMP_SECTION_COMMENTS } from 'projects/coi/src/app/shared-components/coi-review-comments/coi-review-comments-constants';
import { COIReviewCommentsConfig } from 'projects/coi/src/app/shared-components/coi-review-comments/coi-review-comments.interface';
import { RECIPIENT_SUBMODULE_ITEM_KEY } from '../../../shared/management-plan-constants';

@Component({
    selector: 'app-management-plan-builder',
    templateUrl: './management-plan-builder.component.html',
    styleUrls: ['./management-plan-builder.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        DragDropModule,
        SharedComponentModule,
    ],
})
export class ManagementPlanBuilderComponent implements OnInit, OnDestroy {

    isExpandRightNav = false;
    isSaving = false;
    isLoading = false;
    hasAnyEditRight = false;
    isDragDropDisable = false;
    cmpBuilder = new CmpBuilder();

    isBuilderEditable = false;
    hasMaintainCmpRight = false;
    isLoggedPersonReviewer = false;
    isLoggedCmpPerson = false;
    loggedPersonId = '';
    isR = false;
    historyData: {
        logs: CmpBuilderSectionHistory[],
        selectedVersion: number,
        comparedObj: CmpBuilderComponent | CmpBuilderSection,
        compareKey: 'description' | 'sectionName';
    } = null;
    planDetails = new CmpHeader();
    cmpBuilderModalConfig = new CmpBuilderModalConfig();
    intersectionObserverOptions: IntersectionObserverInit;
    CMP_LOCALIZE = CMP_LOCALIZE;
    recipientConfig = new CmpRecipientConfig();
    commentCountMap: Map<string, number | Map<number, number>> = new Map();
    componentTypeCodeMap = {
        SECTION: CMP_SECTION_COMMENTS.componentTypeCode,
        COMPONENT: CMP_COMPONENT_COMMENTS.componentTypeCode,
        RECIPIENT: CMP_RECIPIENT_COMMENTS.componentTypeCode
    };
    recipientSubModuleKey = RECIPIENT_SUBMODULE_ITEM_KEY;

    private $sectionSortTrigger = new Subject();
    private $componentSortTrigger = new Subject();
    private $recipientSortTrigger = new Subject();
    private $subscriptions: Subscription[] = [];
    private timeOutRef: ReturnType<typeof setTimeout>;

    constructor(private _commonService: CommonService,
        private _autoSaveService: AutoSaveService,
        private _elasticConfig: ElasticConfigService,
        public managementPlanService: ManagementPlanService,
        private _managementPlanDataStore: ManagementPlanDataStoreService) {}

    ngOnInit(): void {
        this.loggedPersonId = this._commonService.getCurrentUserDetail('personID');
        this.getDataFromStore({ action: 'REFRESH', dependencies: [] });
        this.listenGlobalEventNotifier();
        this.listenDataChangeFromStore();
        this.setIntersectionObserver();
        this.updateSectionSortOrder();
        this.updateComponentSortOrder();
        this.updateRecipientSortOrder();
        // this.listenAutoSave();
        // this.triggerSingleSave()
    }

    ngOnDestroy(): void {
        clearTimeout(this.timeOutRef);
        subscriptionHandler(this.$subscriptions);
    }

    private listenGlobalEventNotifier(): void {
        this.$subscriptions.push(
            this._commonService.$globalEventNotifier.subscribe((event: GlobalEventNotifier) => {
                const EVENT_DATA = event?.content;
                if (event?.uniqueId === 'TRIGGER_USER_CMP_ACTIONS' && EVENT_DATA?.actionType as ManagementPlanActionType === 'ADD_NEW_SECTION') {
                    this.openPlanBuilderModal('SECTION_ADD');
                }
            })
        );
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this._managementPlanDataStore.dataEvent.subscribe((storeEvent: DataStoreEvent) => {
                this.getDataFromStore(storeEvent);
            })
        );
    }

    private getDataFromStore(storeEvent: DataStoreEvent): void {
        const MANAGEMENT_PLAN: ManagementPlanStoreData = this._managementPlanDataStore.getData();
        this.planDetails = MANAGEMENT_PLAN?.plan;
        if (storeEvent.action === 'REFRESH') {
            this.fetchCmpBuilderData();
        }
        this.cmpBuilder = MANAGEMENT_PLAN?.cmpBuilder;
        if (this.cmpBuilder?.addendum) {
            this.cmpBuilder.addendum.sectionType = 'ADDENDUM';
        }
        this.cmpBuilder.sections?.forEach((section) => section.sectionType = 'DEFAULT_SECTION');
        this.hasMaintainCmpRight = this._managementPlanDataStore.getHasMaintainCmp();
        this.isLoggedCmpPerson = this._managementPlanDataStore.isLoggedCmpPerson();
        this.isLoggedPersonReviewer = this._managementPlanDataStore.isLoggedPersonReviewer();
        this.isBuilderEditable = this._managementPlanDataStore.isFormEditableStatus();
        this.hasAnyEditRight = this.isLoggedCmpPerson || this.hasMaintainCmpRight || this.isLoggedPersonReviewer;
        this.isDragDropDisable = !(this.isBuilderEditable && this.hasAnyEditRight);
        this.setCommentCountMap(MANAGEMENT_PLAN);
    }

    private updateDataStore(): void {
        this._managementPlanDataStore.updateStore(['cmpBuilder'], { cmpBuilder: this.cmpBuilder });
    }

    private setIntersectionObserver(): void {
        this.intersectionObserverOptions = {
            root: document.getElementById('SCROLL_SPY_LEFT_CONTAINER'),
            rootMargin: '100px 0px 100px 0px',
            threshold: Array.from({ length: 100 }, (_, i) => i / 100)
        };
    }

    private fetchCmpBuilderData(): void {
        this.isLoading = true;
        this._commonService.setLoaderRestriction();
        const REQUESTS = {
            sections: this.managementPlanService.fetchCmpBuilderSections(this.planDetails?.cmpId),
            recipients: this.managementPlanService.fetchCmpBuilderRecipients(this.planDetails?.cmpId)
        };
        this.$subscriptions.push(
            forkJoin(REQUESTS).subscribe({
                next: ({ recipients, sections }) => {
                    this.cmpBuilder = { recipients, ...sections as CmpBuilder };
                    this.updateDataStore();
                    this.managementPlanService.configureScrollSpy();
                    this.isLoading = false;
                },
                error: () => {
                    this.isLoading = false;
                    this.managementPlanService.configureScrollSpy();
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to fetch management plan.');
                }
            })
        );
        this._commonService.removeLoaderRestriction();
    }

    private getSaveSectionRO(): CmpBuilderSectionRO {
        const { sectionDetails, sectionName, sortOrder } = this.cmpBuilderModalConfig || {};
        return {
            description: '',
            sortOrder: sortOrder,
            sectionName: sectionName,
            cmpId: this.planDetails?.cmpId,
            cmpSectionRelId: sectionDetails?.cmpSectionRelId || undefined,
        }
    }

    private saveCmpBuilderSection(): void {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(
                this.managementPlanService.saveCmpBuilderSection(this.getSaveSectionRO())
                    .subscribe({
                        next: (sectionDetails: CmpBuilderSection) => {
                            this.cmpBuilder.sections.push(sectionDetails);
                            this.updateDataStore();
                            this.scrollIntoView('cmp-builder-section-item-' + sectionDetails?.cmpSectionRelId);
                            this.isSaving = false;
                            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Section saved successfully.');
                            if (this.cmpBuilderModalConfig.description) {
                                this.cmpBuilderModalConfig.sectionDetails = sectionDetails;
                                this.saveCmpBuilderComponent();
                            } else {
                                this.closeSectionModal();
                            }
                        },
                        error: () => {
                            this.isSaving = false;
                            this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to save management plan section.');
                        }
                    }
                    )
            );
        }
    }

    private updateCmpBuilderSection(updateRO?: CmpBuilderSectionRO): void {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(
                this.managementPlanService.updateCmpBuilderSection(updateRO ? updateRO : this.getSaveSectionRO())
                    .subscribe({
                        next: (sectionDetails: CmpBuilderSection) => {
                            this.cmpBuilder.sections = this.cmpBuilder.sections?.map(section =>
                                section.cmpSectionRelId === sectionDetails?.cmpSectionRelId ? { ...sectionDetails, components: section.components } : section
                            );
                            this.updateDataStore();
                            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Section updated successfully.');
                            this.closeSectionModal();
                            this.isSaving = false;
                        },
                        error: () => {
                            this.isSaving = false;
                            this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to update management plan section.');
                        }
                    }
                    )
            );
        }
    }

    private deleteCmpBuilderSection(cmpSectionRelId: string | number): void {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(
                this.managementPlanService.deleteCmpBuilderSection(cmpSectionRelId)
                    .subscribe({
                        next: (res: any) => {
                            this.deleteSection(cmpSectionRelId);
                            this.updateDataStore();
                            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Section deleted successfully.');
                            this.closeSectionModal();
                            this.isSaving = false;
                        },
                        error: () => {
                            this.isSaving = false;
                            this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to delete management plan section.');
                        }
                    }
                    )
            );
        }
    }

    private deleteSection(cmpSectionRelId: string | number): void {
        const DELETE_INDEX: number = this.cmpBuilder.sections?.findIndex((sectionDetails) => sectionDetails?.cmpSectionRelId === cmpSectionRelId) ?? -1;
        if (DELETE_INDEX > -1) {
            this.cmpBuilder.sections.splice(DELETE_INDEX, 1);
        }
    }

    private getSaveComponentRO(): CmpBuilderComponentRO {
        const { sectionDetails, componentDetails, description, sortOrder } = this.cmpBuilderModalConfig || {};
        return {
            sortOrder: sortOrder,
            description: description.trim(),
            secCompId: componentDetails?.secCompId || undefined,
            cmpSectionRelId: componentDetails?.secCompId ? undefined : sectionDetails?.cmpSectionRelId,
        }
    }

    private validateComponentDescription(): boolean {
        this.cmpBuilderModalConfig.errorMsgMap.delete('CONTENT');
        if (!this.cmpBuilderModalConfig.description.trim()) {
            this.cmpBuilderModalConfig.errorMsgMap.set('CONTENT', 'Please enter the content.');
        }
        return !this.cmpBuilderModalConfig.errorMsgMap.has('CONTENT');
    }

    private saveCmpBuilderComponent(): void {
        if (!this.isSaving && this.validateComponentDescription()) {
            this.isSaving = true;
            this.$subscriptions.push(
                this.managementPlanService.saveCmpBuilderComponent(this.getSaveComponentRO())
                    .subscribe({
                        next: (componentDetails: CmpBuilderComponent) => {
                            const { sectionType, cmpSectionRelId } = this.cmpBuilderModalConfig.sectionDetails || {};
                            if (sectionType === 'ADDENDUM') {
                                this.cmpBuilder.addendum?.components.push(componentDetails)
                            } else {
                                const SECTION_DETAILS: CmpBuilderSection = this.cmpBuilder.sections?.find((sectionDetails) => sectionDetails?.cmpSectionRelId === cmpSectionRelId);
                                SECTION_DETAILS?.components.push(componentDetails);
                            }
                            this.updateDataStore();
                            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Content saved successfully.');
                            this.closeSectionModal();
                            this.scrollIntoView('cmp-builder-comp-item-' + componentDetails.secCompId);
                            this.isSaving = false;
                        },
                        error: () => {
                            this.isSaving = false;
                            this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to save management plan content.');
                        }
                    }
                    )
            );
        }
    }

    private updateCmpBuilderComponent(updateRO?: CmpBuilderComponentRO): void {
        if (!this.isSaving && this.validateComponentDescription()) {
            this.isSaving = true;
            this.$subscriptions.push(
                this.managementPlanService.updateCmpBuilderComponent(updateRO ? updateRO : this.getSaveComponentRO())
                    .subscribe({
                        next: (componentDetails: CmpBuilderComponent) => {
                            this.updateSavedComponentDetails(componentDetails, this.cmpBuilderModalConfig.sectionDetails);
                            this.updateDataStore();
                            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Content updated successfully.');
                            this.closeSectionModal();
                            this.isSaving = false;
                        },
                        error: () => {
                            this.isSaving = false;
                            this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to update management plan content.');
                        }
                    }
                    )
            );
        }
    }

    private updateSavedComponentDetails(componentDetails: CmpBuilderComponent, sectionDetails: CmpBuilderSection): void {
        const { sectionType, cmpSectionRelId } = sectionDetails || {};
        const update = (components = []) => components.map(c => c.secCompId === componentDetails?.secCompId ? componentDetails : c);
        if (sectionType === 'ADDENDUM') {
            this.cmpBuilder.addendum = { ...this.cmpBuilder.addendum, components: update(this.cmpBuilder.addendum?.components) };
        } else {
            this.cmpBuilder.sections = this.cmpBuilder.sections?.map(section =>
                section.cmpSectionRelId !== cmpSectionRelId ? section : { ...section, components: update(section.components) }
            );
        }
    }

    private deleteCmpBuilderComponent(secCompId: string | number): void {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(
                this.managementPlanService.deleteCmpBuilderComponent(secCompId)
                    .subscribe({
                        next: (res: any) => {
                            this.deleteComponent(this.cmpBuilderModalConfig.componentDetails);
                            this.updateDataStore();
                            this._commonService.showToast(HTTP_SUCCESS_STATUS, 'Content deleted successfully.');
                            this.closeSectionModal();
                            this.isSaving = false;
                        },
                        error: () => {
                            this.isSaving = false;
                            this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to delete management plan content.');
                        }
                    }
                    )
            );
        }
    }

    private deleteComponent(componentDetails: CmpBuilderComponent): void {
        const SECTION_DETAILS: CmpBuilderSection = this.cmpBuilder.sections?.find(({ cmpSectionRelId }) => this.cmpBuilderModalConfig.sectionDetails?.cmpSectionRelId === cmpSectionRelId);
        const DELETE_INDEX: number = SECTION_DETAILS?.components?.findIndex(({ secCompId }) => componentDetails?.secCompId === secCompId) ?? -1;
        if (DELETE_INDEX > -1) {
            SECTION_DETAILS.components.splice(DELETE_INDEX, 1);
        }
    }

    private saveCmpBuilderRecipient(): void {
        if (!this.isSaving && this.validateRecipientFields()) {
            this.isSaving = true;
            this.$subscriptions.push(
                this.managementPlanService.saveCmpBuilderRecipients(this.getSaveRecipientRO())
                    .subscribe({
                        next: (recipient: CmpBuilderRecipient) => {
                            this.cmpBuilder.recipients.push(recipient);
                            this.updateDataStore();
                            this.scrollIntoView('cmp-recipient-tr-' + recipient?.cmpRecipientId);
                            this.closeSectionModal();
                            this.isSaving = false;
                            this._commonService.showToast(HTTP_SUCCESS_STATUS, `${CMP_LOCALIZE.TERM_RECIPIENT} saved successfully.`);
                        },
                        error: () => {
                            this.isSaving = false;
                            this._commonService.showToast(HTTP_ERROR_STATUS, `Failed to save management plan ${CMP_LOCALIZE.TERM_RECIPIENT.toLowerCase()}.`);
                        }
                    }
                    )
            );
        }
    }

    private updateCmpBuilderRecipient(updateRO?: CmpBuilderRecipientRO): void {
        if (!this.isSaving && this.validateRecipientFields()) {
            this.isSaving = true;
            this.$subscriptions.push(
                this.managementPlanService.updateCmpBuilderRecipients(updateRO ? updateRO : this.getSaveRecipientRO())
                    .subscribe({
                        next: (recipientDetails: CmpBuilderRecipient) => {
                            this.cmpBuilder.recipients = this.cmpBuilder.recipients?.map(section =>
                                section.cmpRecipientId === recipientDetails?.cmpRecipientId ? recipientDetails : section
                            );
                            this.updateDataStore();
                            this.closeSectionModal();
                            this.isSaving = false;
                            this._commonService.showToast(HTTP_SUCCESS_STATUS, `${CMP_LOCALIZE.TERM_RECIPIENT} updated successfully.`);
                        },
                        error: () => {
                            this.isSaving = false;
                            this._commonService.showToast(HTTP_ERROR_STATUS, `Failed to update management plan ${CMP_LOCALIZE.TERM_RECIPIENT.toLowerCase()}.`);
                        }
                    }
                    )
            );
        }
    }

    private deleteCmpBuilderRecipient(cmpRecipientId: string | number): void {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(
                this.managementPlanService.deleteCmpBuilderRecipients(cmpRecipientId)
                    .subscribe({
                        next: (res: any) => {
                            this.deleteRecipient(cmpRecipientId);
                            this.updateDataStore();
                            this.closeSectionModal();
                            this.isSaving = false;
                            this._commonService.showToast(HTTP_SUCCESS_STATUS, `${CMP_LOCALIZE.TERM_RECIPIENT} deleted successfully.`);
                        },
                        error: () => {
                            this.isSaving = false;
                            this._commonService.showToast(HTTP_ERROR_STATUS, `Failed to delete management plan ${CMP_LOCALIZE.TERM_RECIPIENT.toLowerCase()}.`);
                        }
                    }
                    )
            );
        }
    }

    private deleteRecipient(cmpRecipientId: string | number): void {
        const DELETE_INDEX: number = this.cmpBuilder.recipients?.findIndex((recipientDetails) => recipientDetails?.cmpRecipientId === cmpRecipientId) ?? -1;
        if (DELETE_INDEX > -1) {
            this.cmpBuilder.recipients.splice(DELETE_INDEX, 1);
        }
    }

    private getBuilderModalConfig(actionType: CmpBuilderModalType): CommonModalConfig {
        switch (actionType) {
            case 'SECTION_ADD': return new CommonModalConfig('cmp-add-section-modal', 'Add', 'Cancel', 'xl');
            case 'SECTION_EDIT': return new CommonModalConfig('cmp-edit-section-modal', 'Update', 'Cancel', 'lg');
            case 'SECTION_DELETE': return new CommonModalConfig('cmp-delete-section-modal', 'Delete', 'Cancel');
            case 'SECTION_HISTORY': return new CommonModalConfig('cmp-history-section-modal', '', 'Close', 'xl');
            case 'COMPONENT_ADD': return new CommonModalConfig('cmp-add-component-modal', 'Add', 'Cancel', 'xl');
            case 'COMPONENT_EDIT': return new CommonModalConfig('cmp-edit-component-modal', 'Update', 'Cancel', 'xl');
            case 'COMPONENT_DELETE': return new CommonModalConfig('cmp-delete-component-modal', 'Delete', 'Cancel');
            case 'COMPONENT_HISTORY': return new CommonModalConfig('cmp-history-component-modal', '', 'Close', 'xl');
            case 'RECIPIENT_ADD': return new CommonModalConfig('cmp-add-recipient-modal', 'Add', 'Cancel', 'xl');
            case 'RECIPIENT_EDIT': return new CommonModalConfig('cmp-edit-recipient-modal', 'Update', 'Cancel', 'xl');
            case 'RECIPIENT_DELETE': return new CommonModalConfig('cmp-delete-recipient-modal', 'Delete', 'Cancel');
            default: return new CommonModalConfig('cmp-add-section-modal', 'Add', 'Cancel', 'xl');
        }
    }

    private getBuilderSortOrder(actionType: CmpBuilderModalType, sectionDetails: CmpBuilderSection, componentDetails: CmpBuilderComponent): number | null {
        switch (actionType) {
            case 'SECTION_ADD':
                return this.cmpBuilder.sections?.length || 1;
            case 'SECTION_EDIT':
            case 'SECTION_DELETE':
                return sectionDetails?.sortOrder;
            case 'COMPONENT_ADD':
                return sectionDetails?.components?.length || 1;
            case 'COMPONENT_EDIT':
            case 'COMPONENT_DELETE':
                return componentDetails?.sortOrder;
            default: return null;
        }
    }

    private getBuilderModalBody(actionType: CmpBuilderModalType, sectionDetails: CmpBuilderSection): string {
        switch (actionType) {
            case 'SECTION_DELETE': {
                const SECTION_NAME = sectionDetails?.sectionName ? `<strong>${sectionDetails.sectionName}</strong>` : `<i>${CMP_LOCALIZE.CMP_BUILDER_DEFAULT_SECTION_HEADER}</i>`;
                return `Are you sure you want to delete ${SECTION_NAME}?`
            };
            case 'COMPONENT_DELETE': return `Are you sure you want to delete content?`;
            case 'RECIPIENT_DELETE': return `Are you sure you want to delete ${CMP_LOCALIZE.TERM_RECIPIENT}?`;
            default: return '';
        }
    }

    private getBuilderModalHeader(actionType: CmpBuilderModalType, sectionDetails: CmpBuilderSection): string {
        const DEFAULT_NAME = `<i class="coi-text-light">${CMP_LOCALIZE.CMP_BUILDER_DEFAULT_SECTION_HEADER}<i>`
        const MODAL_HEADER = `<span class="text-slice" title="${sectionDetails?.sectionName || CMP_LOCALIZE.CMP_BUILDER_DEFAULT_SECTION_HEADER}">ACTION_TYPE ${sectionDetails?.sectionName || DEFAULT_NAME}</span>`
        switch (actionType) {
            case 'SECTION_ADD': return `Add New Section`;
            case 'SECTION_EDIT': return `Update Section Name`;
            case 'SECTION_DELETE': return MODAL_HEADER.replace('ACTION_TYPE', 'Delete');
            case 'SECTION_HISTORY': return MODAL_HEADER.replace('ACTION_TYPE', 'History of');
            case 'COMPONENT_ADD': return MODAL_HEADER.replace('ACTION_TYPE', 'Add');
            case 'COMPONENT_EDIT': return MODAL_HEADER.replace('ACTION_TYPE', 'Update');
            case 'COMPONENT_DELETE': return `Delete Content`;
            case 'COMPONENT_HISTORY': return MODAL_HEADER.replace('ACTION_TYPE', 'History of');
            case 'RECIPIENT_ADD': return `<span class="text-slice" title="${CMP_LOCALIZE.TERM_RECIPIENT}">Add ${CMP_LOCALIZE.TERM_RECIPIENT}</span>`;
            case 'RECIPIENT_EDIT': return `<span class="text-slice" title="${CMP_LOCALIZE.TERM_RECIPIENT}">Update ${CMP_LOCALIZE.TERM_RECIPIENT}</span>`;
            case 'RECIPIENT_DELETE': return `Delete ${CMP_LOCALIZE.TERM_RECIPIENT}`;
            default: return `Add New Section`;
        }
    }

    private updateSectionSortOrder(): void {
        this.$subscriptions.push(
            this.$sectionSortTrigger.pipe(
                switchMap(() => {
                    this._commonService.showAutoSaveSpinner();
                    const UPDATE_REQUESTS = this.cmpBuilder.sections.map(section => {
                        const UPDATE_RO: CmpBuilderSectionRO = {
                            sortOrder: section.sortOrder,
                            cmpSectionRelId: section.cmpSectionRelId,
                        };
                        return this.managementPlanService.updateCmpBuilderSection(UPDATE_RO);
                    });
                    return forkJoin(UPDATE_REQUESTS);
                })
            ).subscribe({
                next: (response: CmpBuilderSection[]) => {
                    this.cmpBuilder.sections = this.cmpBuilder.sections?.map(section => {
                        const UPDATED_SECTION = response.find(sectionDetails => sectionDetails?.cmpSectionRelId === section?.cmpSectionRelId);
                        return UPDATED_SECTION ? { ...UPDATED_SECTION, components: section.components } : section;
                    });
                    this.updateDataStore();
                    this._commonService.hideAutoSaveSpinner('SUCCESS');
                    this.managementPlanService.triggerManagementPlanActions('FORM_SAVE_COMPLETE', response[0]);
                },
                error: () => {
                    this._commonService.hideAutoSaveSpinner('SUCCESS');
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to update management plan section sorting.');
                }
            })
        );
    }

    private updateComponentSortOrder(): void {
        this.$subscriptions.push(
            this.$componentSortTrigger.pipe(
                switchMap((sectionDetails: CmpBuilderSection) => {
                    this._commonService.showAutoSaveSpinner();
                    const UPDATE_REQUESTS = sectionDetails.components.map((componentDetails: CmpBuilderComponent) => {
                        const UPDATE_RO: CmpBuilderComponentRO = {
                            sortOrder: componentDetails?.sortOrder,
                            secCompId: componentDetails?.secCompId,
                        };
                        return this.managementPlanService.updateCmpBuilderComponent(UPDATE_RO);
                    });
                    return forkJoin(UPDATE_REQUESTS);
                })
            ).subscribe({
                next: (response: CmpBuilderComponent[]) => {
                    const SECTION_INDEX = this.cmpBuilder.sections.findIndex(({ cmpSectionRelId }) => cmpSectionRelId === response[0]?.cmpSectionRelId);
                    if (SECTION_INDEX > -1) {
                        this.cmpBuilder.sections[SECTION_INDEX].components = response;
                    }
                    this.updateDataStore();
                    this._commonService.hideAutoSaveSpinner('SUCCESS');
                    this.managementPlanService.triggerManagementPlanActions('FORM_SAVE_COMPLETE', response[0]);
                },
                error: () => {
                    this._commonService.hideAutoSaveSpinner('SUCCESS');
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to update management plan content sorting.');
                }
            })
        );
    }

    private updateRecipientSortOrder(): void {
        this.$subscriptions.push(
            this.$recipientSortTrigger.pipe(
                switchMap(() => {
                    this._commonService.showAutoSaveSpinner();
                    const UPDATE_REQUESTS = this.cmpBuilder.recipients.map((recipientDetails: CmpBuilderRecipient) => {
                        const UPDATE_RO: CmpBuilderRecipientRO = {
                            signOrder: recipientDetails?.signOrder,
                            cmpRecipientId: recipientDetails?.cmpRecipientId || undefined,
                        };
                        return this.managementPlanService.updateCmpBuilderRecipients(UPDATE_RO);
                    });
                    return forkJoin(UPDATE_REQUESTS);
                })
            ).subscribe({
                next: (recipients: CmpBuilderRecipient[]) => {
                    this.cmpBuilder.recipients = recipients;
                    this.updateDataStore();
                    this._commonService.hideAutoSaveSpinner('SUCCESS');
                    this.managementPlanService.triggerManagementPlanActions('FORM_SAVE_COMPLETE', recipients[0]);
                },
                error: () => {
                    this._commonService.hideAutoSaveSpinner('SUCCESS');
                    this._commonService.showToast(HTTP_ERROR_STATUS, `Failed to update management plan ${CMP_LOCALIZE.TERM_RECIPIENT.toLowerCase()} sorting.`);
                }
            })
        );
    }

    private triggerSectionSort(): void {
        this._commonService.setLoaderRestriction();
        this.$sectionSortTrigger.next();
        this._commonService.removeLoaderRestriction();
    }

    private triggerComponentSort(sectionDetails: CmpBuilderSection): void {
        this._commonService.setLoaderRestriction();
        this.$componentSortTrigger.next(sectionDetails);
        this._commonService.removeLoaderRestriction();
    }

    private triggerRecipientSort(): void {
        this._commonService.setLoaderRestriction();
        this.$recipientSortTrigger.next();
        this._commonService.removeLoaderRestriction();
    }

    private clearRecipientErrorMap(field: CmpRecipientFieldsType): void {
        this.recipientConfig.errorMsgMap?.delete(field);
    }

    private validateRecipientFields(): boolean {
        const { attestationStatement, designation, personId, signatureBlock, } = this.getSaveRecipientRO();
        this.recipientConfig.mandatoryFieldsList?.forEach((field: CmpRecipientFieldsType) => {
            this.clearRecipientErrorMap(field);
            let message = '';
            switch (field) {
                case 'PERSON_SEARCH': if (!personId) message = `Please select the person.`;
                    break;
                case 'SIGNATURE_BLOCK': if (!signatureBlock) message = `Please provide the signature block.`;
                    break;
                case 'DESIGNATION': if (!designation) message = `Please provide the designation.`;
                    break;
                case 'ATTESTATION': if (!attestationStatement) message = `Please provide the attestation.`;
                    break;
                default: message = '';
                    break;
            }
            message && this.recipientConfig.errorMsgMap?.set(field, message);
        });
        return this.recipientConfig.errorMsgMap.size === 0;
    }

    private setCommentCountMap(MANAGEMENT_PLAN: ManagementPlanStoreData): void {
        const REVIEW_COMMENTS = MANAGEMENT_PLAN?.cmpCommentsCount?.reviewCommentsCount;
        if (REVIEW_COMMENTS?.length) {
            const resultMap = new Map<string, number | Map<number, number>>();
            REVIEW_COMMENTS.forEach(({ componentTypeCode, subModuleItemKey, count }) => {
                // subModuleItemKey is null → assign count directly
                if (subModuleItemKey == null) {
                    resultMap.set(componentTypeCode, count);
                    return;
                }
                //subModuleItemKey exists → nested map
                if (!resultMap.has(componentTypeCode) || typeof resultMap.get(componentTypeCode) === 'number') {
                    resultMap.set(componentTypeCode, new Map<number, number>());
                }
                (resultMap.get(componentTypeCode) as Map<number, number>)
                    .set(Number(subModuleItemKey), count);
            });
            this.commentCountMap = resultMap;
        }
    }

    getCmpSectionHistory(sectionDetails: CmpBuilderSection): void {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(
                this.managementPlanService.getCmpSectionHistory(sectionDetails.cmpSectionRelId)
                    .subscribe({
                        next: (res: any) => {
                            const PARSED_DATA = res.map((log) => ({
                                ...log,
                                newData: log.newData ? JSON.parse(log.newData) : null,
                                oldData: log.oldData ? JSON.parse(log.oldData) : null
                            }));
                            const SELECTED_VERSION = deepCloneObject(PARSED_DATA[0].newData);
                            const PREVIOUS_VERSION = deepCloneObject(PARSED_DATA[0].oldData || null);
                            const COMPARED = compareObject(SELECTED_VERSION, PREVIOUS_VERSION, ['sectionName']) as CmpBuilderComponent;
                            this.historyData = {
                                logs: deepCloneObject(PARSED_DATA),
                                selectedVersion: 0,
                                comparedObj: COMPARED,
                                compareKey: 'sectionName'
                            };
                            this.openPlanBuilderModal('SECTION_HISTORY', sectionDetails);
                            this.isSaving = false;
                        },
                        error: () => {
                            this.isSaving = false;
                            this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to fetch section history.');
                        }
                    }
                    )
            );
        }
    }

    getCmpComponentHistory(sectionDetails: CmpBuilderSection, componentDetails: CmpBuilderComponent): void {
        if (!this.isSaving) {
            this.isSaving = true;
            this.$subscriptions.push(
                this.managementPlanService.getCmpComponentHistory(componentDetails.secCompId)
                    .subscribe({
                        next: (res: CmpBuilderSectionHistory[]) => {
                            const PARSED_DATA = res.map((log) => ({
                                ...log,
                                newData: log.newData ? JSON.parse(log.newData) : null,
                                oldData: log.oldData ? JSON.parse(log.oldData) : null
                            }));
                            const SELECTED_VERSION = deepCloneObject(PARSED_DATA[0].newData);
                            const PREVIOUS_VERSION = deepCloneObject(PARSED_DATA[0].oldData || null);
                            const COMPARED = compareObject(SELECTED_VERSION, PREVIOUS_VERSION, ['description']) as CmpBuilderComponent;
                            this.historyData = {
                                logs: deepCloneObject(PARSED_DATA),
                                selectedVersion: 0,
                                comparedObj: COMPARED,
                                compareKey: 'description'
                            };
                            this.openPlanBuilderModal('COMPONENT_HISTORY', sectionDetails);
                            this.isSaving = false;
                        },
                        error: () => {
                            this.isSaving = false;
                            this._commonService.showToast(HTTP_ERROR_STATUS, 'Failed to fetch content history.');
                        }
                    }
                    )
            );
        }
    }

    openReviewCommentsSlider(sectionDetails: CmpBuilderSection, section: 'SECTION' | 'COMPONENT' | 'RECIPIENT', childSubSection?: CmpBuilderComponent) {
        const MANAGEMENT_PLAN_DETAILS: CmpHeader = this._managementPlanDataStore.getData()?.plan;
        const CMP_BUILDER_DATA: CmpBuilderData = this.getCmpBuilderData(section, childSubSection, sectionDetails);
        const REQ_BODY: FetchReviewCommentRO = {
            componentTypeCode: CMP_BUILDER_DATA?.componentTypeCode,
            moduleItemKey: MANAGEMENT_PLAN_DETAILS?.cmpId,
            moduleItemNumber: MANAGEMENT_PLAN_DETAILS?.cmpNumber,
            subModuleCode: null,
            subModuleItemKey: CMP_BUILDER_DATA?.subModuleItemKey,
            subModuleItemNumber: null,
            isSectionDetailsNeeded: true,
            documentOwnerPersonId: this.planDetails?.person?.personId
        }
        const REVIEW_COMMENTS_CARD_CONFIG: Partial<COIReviewCommentsConfig> = {
            moduleSectionDetails: {
                sectionId: CMP_BUILDER_DATA?.subModuleItemKey || '',
                sectionName: section === 'RECIPIENT' ? (CMP_LOCALIZE.TERM_RECIPIENT + 's') : sectionDetails.sectionName,
                sectionKey: childSubSection ? (section === 'COMPONENT' ? childSubSection?.secCompId : sectionDetails.cmpSectionRelId) : '',
                subsectionId: childSubSection ? (section === 'COMPONENT' ? childSubSection?.secCompId : '') : '',
                subsectionName: childSubSection ? (section === 'COMPONENT' ? childSubSection?.description : '') : '',
            },
            componentDetails: {
                componentName: CMP_BUILDER_DATA?.componentName,
                componentTypeCode: CMP_BUILDER_DATA?.componentTypeCode,
            }
        }
        this.managementPlanService.setReviewCommentSliderConfig(REQ_BODY, REVIEW_COMMENTS_CARD_CONFIG);
    }

    private getCmpBuilderData(section: CmpBuilderType, childSubSection?: CmpBuilderComponent, sectionDetails?: CmpBuilderSection): CmpBuilderData {
        const CONFIG: Record<CmpBuilderType, CmpBuilderData> = {
            SECTION: {
                componentTypeCode: CMP_SECTION_COMMENTS.componentTypeCode,
                componentName: CMP_SECTION_COMMENTS.componentName,
                subModuleItemKey: sectionDetails?.cmpSectionRelId?.toString() ?? null,
            },
            COMPONENT: {
                componentTypeCode: CMP_COMPONENT_COMMENTS.componentTypeCode,
                componentName: CMP_COMPONENT_COMMENTS.componentName,
                subModuleItemKey: childSubSection?.secCompId?.toString() ?? null,
            },
            RECIPIENT: {
                componentTypeCode: CMP_RECIPIENT_COMMENTS.componentTypeCode,
                componentName: CMP_RECIPIENT_COMMENTS.componentName,
                subModuleItemKey: RECIPIENT_SUBMODULE_ITEM_KEY.toString(),// SubmoduleItemKey for recipient is set to '0'
            }
        };
        return { ...CONFIG[section] };
    }

    openPlanBuilderModal(actionType: CmpBuilderModalType, sectionDetails: CmpBuilderSection | null = null, componentDetails: CmpBuilderComponent = null): void {
        this.cmpBuilderModalConfig = new CmpBuilderModalConfig();
        this.cmpBuilderModalConfig.actionType = actionType;
        this.cmpBuilderModalConfig.sectionDetails = sectionDetails;
        this.cmpBuilderModalConfig.componentDetails = componentDetails;
        this.cmpBuilderModalConfig.sectionName = sectionDetails?.sectionName || '';
        this.cmpBuilderModalConfig.description = componentDetails?.description || '';
        this.cmpBuilderModalConfig.modalConfig = this.getBuilderModalConfig(actionType);
        this.cmpBuilderModalConfig.modalBody = this.getBuilderModalBody(actionType, sectionDetails);
        this.cmpBuilderModalConfig.modalHeader = this.getBuilderModalHeader(actionType, sectionDetails);
        this.cmpBuilderModalConfig.sortOrder = this.getBuilderSortOrder(actionType, sectionDetails, componentDetails);
        this.cmpBuilderModalConfig.isOpenModal = true;
        setTimeout(() => {
            openCommonModal(this.cmpBuilderModalConfig.modalConfig.namings.modalName);
        });
    }

    trackBySectionId(index: number, sectionDetails: CmpBuilderSection): number | string {
        return sectionDetails?.cmpSectionRelId ?? index;
    }

    onSectionDrop(event: CdkDragDrop<any[]>): void {
        if (this.isLoading || !event || event.previousIndex === event.currentIndex) {
            return;
        }
        moveItemInArray(this.cmpBuilder.sections, event.previousIndex, event.currentIndex);
        this.cmpBuilder.sections.forEach((section, index) => section.sortOrder = index + 1);
        this.triggerSectionSort();
    }

    onComponentDrop(sectionDetails: CmpBuilderSection, event: CdkDragDrop<any[]>): void {
        if (this.isLoading || !event || event.previousIndex === event.currentIndex) {
            return;
        }
        moveItemInArray(sectionDetails.components, event.previousIndex, event.currentIndex);
        sectionDetails.components.forEach((component, index) => component.sortOrder = index + 1);
        this.triggerComponentSort(sectionDetails);
    }

    onRecipientDrop(event: CdkDragDrop<any[]>): void {
        if (this.isLoading || !event || event.previousIndex === event.currentIndex) {
            return;
        }
        moveItemInArray(this.cmpBuilder.recipients, event.previousIndex, event.currentIndex);
        this.cmpBuilder.recipients.forEach((section, index) => section.signOrder = index + 1);
        this.triggerRecipientSort();
    }

    onReady(editor: any): void {
        editor?.ui?.getEditableElement()?.parentElement?.insertBefore(
            editor?.ui?.view?.toolbar?.element,
            editor?.ui?.getEditableElement()
        );
        this.cmpBuilderModalConfig.editorElement = editor?.ui?.getEditableElement();
    }

    performCmpBuilderAction(modalAction: ModalActionEvent): void {
        if (modalAction.action === 'PRIMARY_BTN') {
            switch (this.cmpBuilderModalConfig.actionType) {
                case 'COMPONENT_DELETE': return this.deleteCmpBuilderComponent(this.cmpBuilderModalConfig.componentDetails?.secCompId);
                case 'SECTION_DELETE': return this.deleteCmpBuilderSection(this.cmpBuilderModalConfig.sectionDetails?.cmpSectionRelId);
                case 'SECTION_ADD': return this.saveCmpBuilderSection();
                case 'SECTION_EDIT': return this.updateCmpBuilderSection();
                case 'COMPONENT_ADD': return this.saveCmpBuilderComponent();
                case 'COMPONENT_EDIT': return this.updateCmpBuilderComponent();
                case 'RECIPIENT_ADD': return this.saveCmpBuilderRecipient();
                case 'RECIPIENT_EDIT': return this.updateCmpBuilderRecipient();
                case 'RECIPIENT_DELETE': return this.deleteCmpBuilderRecipient(this.recipientConfig.recipient?.cmpRecipientId);
                default: break;
            }
        } else {
            this.closeSectionModal();
        }
    }

    closeSectionModal(): void {
        closeCommonModal(this.cmpBuilderModalConfig.modalConfig?.namings?.modalName);
        setTimeout(() => {
            this.cmpBuilderModalConfig = new CmpBuilderModalConfig();
        }, 200);
    }

    updateScrollSpyConfig(event: { isVisible: boolean; observerEntry: IntersectionObserverEntry; }, sectionIndex: number): void {
        this.managementPlanService.updateScrollSpyConfig(event, sectionIndex);
    }

    scrollIntoView(elementId: string): void {
        clearTimeout(this.timeOutRef);
        window.scroll(0, 0);
        this.timeOutRef = setTimeout(() => {
            const ELEMENT: HTMLElement = document.getElementById(elementId);
            ELEMENT?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }, 50);
    }

    componentVersionChange(index: number): void {
        if (index !== this.historyData.selectedVersion) {
            this.historyData.selectedVersion = index;
            const SELECTED_VERSION = deepCloneObject(this.historyData.logs[index].newData);
            const PREVIOUS_VERSION = deepCloneObject(this.historyData.logs[index].oldData || null);
            this.historyData.comparedObj = compareObject(SELECTED_VERSION, PREVIOUS_VERSION, [this.historyData.compareKey]) as CmpBuilderComponent
        }
    }

    openRecipientConfigModal(actionType: CmpBuilderModalType, recipientDetails = new CmpBuilderRecipient): void {
        this.recipientConfig = new CmpRecipientConfig();
        this.recipientConfig.recipient = recipientDetails;
        this.recipientConfig.personSearchOptions = this._elasticConfig.getElasticForPerson();
        this.recipientConfig.personSearchOptions.defaultValue = recipientDetails?.fullName || '';
        this.openPlanBuilderModal(actionType);
    }

    selectedPerson(person: ElasticPersonSource): void {
        this.recipientConfig.personSearchResult = person ? setPersonObjectFromElasticResult(person) : null;
        this.recipientConfig.recipient.fullName = this.recipientConfig.personSearchResult?.fullName || '';
        this.recipientConfig.recipient.personId = this.recipientConfig.personSearchResult?.personId || '';
        this.recipientConfig.recipient.designation = this.recipientConfig.personSearchResult?.primaryTitle || '';
    }

    getSaveRecipientRO(): CmpBuilderRecipientRO {
        const { attestationStatement, cmpRecipientId, designation, personId, signatureBlock, signOrder } = this.recipientConfig?.recipient || {};
        return {
            personId: personId || '',
            designation: designation || '',
            cmpId: this.planDetails?.cmpId,
            signatureBlock: signatureBlock || '',
            cmpRecipientId: cmpRecipientId || undefined,
            attestationStatement: attestationStatement || '',
            signOrder: cmpRecipientId ? signOrder : (this.cmpBuilder.recipients?.length + 1)
        }
    }

}
