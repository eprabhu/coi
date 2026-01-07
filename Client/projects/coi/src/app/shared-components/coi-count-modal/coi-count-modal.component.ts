import { Subscription } from 'rxjs';
import { CoiCountModalService } from './coi-count-modal.service';
import { CommonService } from '../../common/services/common.service';
import { DashboardProjectCount, FetchEachOrAllEngagementsRO } from '../../common/services/coi-common.interface';
import { CommonModalConfig, ModalActionEvent } from '../common-modal/common-modal.interface';
import { COI_MODULE_CODE, COMMON_ERROR_TOAST_MSG, DISCLOSURE_CONFLICT_STATUS_BADGE, DISCLOSURE_TYPE, HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS, OPA_MODULE_CODE, PROJECT_TYPE } from '../../app-constants';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { subscriptionHandler } from '../../../../../fibi/src/app/common/utilities/subscription-handler';
import { closeCommonModal, fileDownloader, getFormattedSponsor, openCommonModal } from '../../common/utilities/custom-utilities';
import { COICountModalViewSlider, COICountModal, COICountModalClose, CountModalDisclosureProjectData, COICountModalProjectUpdate } from '../shared-interface';
import { COIAttachment } from '../../attachments/attachment-interface';
import { Router } from '@angular/router';
import { OpaPersonEngagementService } from '../../configuration/form-builder-create/shared/form-builder-view/PE-components/OPA-person-engagements/opa-person-engagement.service';
import { OpaPersonEngagementFetchRO } from '../../configuration/form-builder-create/shared/common.interface';

@Component({
    selector: 'app-coi-count-modal',
    templateUrl: './coi-count-modal.component.html',
    styleUrls: ['./coi-count-modal.component.scss'],
    providers: [CoiCountModalService]
})
export class CoiCountModalComponent implements OnInit, OnDestroy {

    slicedHeaderPart = '';
    SfiDetailsList: any[] = [];
    isShowFCOIRelationshipColumn = false;
    isShowOPARelationshipColumn = false;
    PROJECT_TYPE = PROJECT_TYPE;
    currentActiveModuleCode: number;
    DISCLOSURE_TYPE = DISCLOSURE_TYPE;
    $subscriptions: Subscription[] = [];
    COI_COUNT_MODAL_ID = 'coi-count-modal';
    projectCountList: DashboardProjectCount[] = [];
    projectsList: CountModalDisclosureProjectData[] = [];
    filteredProjectsList: CountModalDisclosureProjectData[] = [];
    countModalConfig = new CommonModalConfig(this.COI_COUNT_MODAL_ID, '', 'Close', 'xl');
    attachmentLists: COIAttachment[] = [];
    filteredCoiAttachmentsList: COIAttachment[] = [];
    isAttachmentDownloading = false;
    coiModuleCode = COI_MODULE_CODE;
    opaModuleCode = OPA_MODULE_CODE;
    opaPersonEngagementRO = new OpaPersonEngagementFetchRO();

    @Input() coiCountModal = new COICountModal();

    @Output() viewSlider = new EventEmitter<COICountModalViewSlider>();
    @Output() countModalClose = new EventEmitter<COICountModalClose>();
    @Output() coiCountModalChange = new EventEmitter<COICountModal>();

    constructor(private _coiCountModalService: CoiCountModalService, 
        public commonService: CommonService, private _opaPersonEngagementService: OpaPersonEngagementService, private _router: Router) { }

    ngOnInit(): void {
        const { fcoiTypeCode, moduleCode, inputType, personUnit } = this.coiCountModal;
        this.slicedHeaderPart = moduleCode === this.opaModuleCode ? personUnit?.unitDisplayName: 
        (fcoiTypeCode !== DISCLOSURE_TYPE.PROJECT ? this.getFormattedPeronUnit() : this.getProjectHeader());
        if (inputType === 'DISCLOSURE_ATTACHMENT') {
            this.getDisclosureRelatedAttachments();
        } else if (moduleCode === this.coiModuleCode) {
            this.getSFIDatas();
        } else if (moduleCode === this.opaModuleCode) {
            this.getSFIDatasOfOpa();
        }
        else if (moduleCode === 101 && inputType === 'SFI_TAB') {
            this.getDisclosureDatas();
        } else if (inputType === 'DISCLOSURE_TAB') {
            this.getProjectsList();
        }
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private getRequestObject(): FetchEachOrAllEngagementsRO {
        return {
            pageNumber: 0,
            currentPage: 0,
            filterType: '',
            searchWord: '',
            reviewStatusCode: '',
            dispositionStatusCode: null,
            personId: this.coiCountModal.personId,
            disclosureId: this.coiCountModal.disclosureId,
            sortType: ''
        };
    }

    private getRequestObjectForOpa(): OpaPersonEngagementFetchRO {
        const OPA_RO = new OpaPersonEngagementFetchRO();
        OPA_RO.opaDisclosureId = this.coiCountModal.disclosureId;
        OPA_RO.loggedInUserPersonId = this.commonService.getCurrentUserDetail('personID');
        OPA_RO.documentOwnerPersonId = this.coiCountModal.personId;
        return OPA_RO;
    }

    private getSFIDatas(): void {
        this.$subscriptions.push(
            this.commonService.fetchEachOrAllEngagements(this.getRequestObject())
                .subscribe((data: any) => {
                    this.SfiDetailsList = data.personEntities;
                    this.isShowFCOIRelationshipColumn = this.SfiDetailsList?.some(item =>
                        item?.validPersonEntityRelTypes?.some(relation =>
                            relation.relationshipTypeCode
                        )
                    );
                    openCommonModal(this.COI_COUNT_MODAL_ID);
                }, (_error: any) => {
                    this.closeCoiCountModal();
                    this.commonService.showToast(HTTP_ERROR_STATUS, 'Something went wrong. Please try again.');
                }));
    }

    private getSFIDatasOfOpa(): void {
        this.$subscriptions.push(
            this._opaPersonEngagementService.fetchEngagementAfterAction(this.getRequestObjectForOpa())
                .subscribe((data: any) => {
                    this.SfiDetailsList = data.engagementDetails;
                    this.isShowOPARelationshipColumn = this.SfiDetailsList?.some(item =>
                        item?.relationships?.length
                    );
                    openCommonModal(this.COI_COUNT_MODAL_ID);
                }, (_error: any) => {
                    this.closeCoiCountModal();
                    this.commonService.showToast(HTTP_ERROR_STATUS, 'Something went wrong. Please try again.');
                }));
    }

    private getProjectsList(): void {
        this.$subscriptions.push(
            this._coiCountModalService.getDisclosureProjects(this.coiCountModal.disclosureId)
                .subscribe((projectList: any) => {
                    this.setProjectList(projectList);
                    openCommonModal(this.COI_COUNT_MODAL_ID);
                }, (_error: any) => {
                    this.closeCoiCountModal();
                    this.commonService.showToast(HTTP_ERROR_STATUS, 'Something went wrong. Please try again.');
                }));
    }

    private setProjectList(projectList: any): void {
        const UPDATED_OBJECT: COICountModalProjectUpdate = this.getUpdatedProjectsList(projectList);
        this.projectsList = UPDATED_OBJECT.updatedProjectsList;
        this.projectCountList = UPDATED_OBJECT.projectCountList;
        this.switchProject(this.coiCountModal.moduleCode);
    }

    private getUpdatedProjectsList(projectsList: CountModalDisclosureProjectData[]): COICountModalProjectUpdate {
        const PROJECT_COUNT_MAP = new Map<number, DashboardProjectCount>();
        const UPDATED_PROJECT_LIST = projectsList.map((project: CountModalDisclosureProjectData) => {
            const { moduleCode, projectType, sponsorCode, sponsorName, primeSponsorCode, primeSponsorName, conflictStatusCode } = project;
            // Update the project with formatted fields
            const UPDATED_PROJECT = {
                ...project,
                formattedSponsor: getFormattedSponsor(sponsorCode, sponsorName),
                formattedProjectHeader: this.getFormattedProjectHeader(project),
                formattedLeadUnit: this.commonService.getPersonLeadUnitDetails(project),
                disclosureConflictBadge: DISCLOSURE_CONFLICT_STATUS_BADGE[conflictStatusCode],
                formattedPrimeSponsor: getFormattedSponsor(primeSponsorCode, primeSponsorName)
            };
            // Update project count map
            if (moduleCode >= 0 && projectType) {
                const PROJECT_COUNT = PROJECT_COUNT_MAP.get(moduleCode) || { moduleCode, projectType, projectCount: 0 };
                PROJECT_COUNT.projectCount++;
                PROJECT_COUNT_MAP.set(moduleCode, PROJECT_COUNT);
            }
            return UPDATED_PROJECT;
        });

        return {
            updatedProjectsList: UPDATED_PROJECT_LIST,
            projectCountList: Array.from(PROJECT_COUNT_MAP.values())
        };
    }

    private getFormattedProjectHeader(project: CountModalDisclosureProjectData): string {
        const { projectNumber, title } = project || {};
        if (projectNumber && title) {
            return `#${projectNumber} - ${title}`;
        }
        return projectNumber ? `#${projectNumber}` : title || '';
    }
    

    private getDisclosureDatas(): void {
        this.$subscriptions.push(
            this._coiCountModalService.getDisclosureDetails(this.coiCountModal.disclosureId)
                .subscribe((data: any) => {
                    this.SfiDetailsList = data;
                    openCommonModal(this.COI_COUNT_MODAL_ID);
                }, (_error: any) => {
                    this.closeCoiCountModal();
                    this.commonService.showToast(HTTP_ERROR_STATUS, 'Something went wrong. Please try again.');
                }));
    }

    private filterByModuleCode(moduleCode: number): CountModalDisclosureProjectData[] {
        return this.projectsList.filter((item: CountModalDisclosureProjectData) => item.moduleCode === moduleCode);
    }

    private getDisclosureRelatedAttachments(): void {
        this._coiCountModalService.fetchDisclosureAttachments(this.coiCountModal?.disclosureId).subscribe((data: COIAttachment[]) => {
            this.attachmentLists = data;
            this.filterLatestVersions();
            openCommonModal(this.COI_COUNT_MODAL_ID);
        }, (_err) => {
            this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
            this.closeCoiCountModal();
        })
    }

    /**
    * Filters and retains only the latest versions of attachments.
    *
    * This method processes `attachmentLists` by grouping attachments based on their 
    * `attachmentNumber`. For attachments with multiple versions, it sorts them in 
    * descending order by `versionNumber` and keeps only the latest version. Older 
    * versions are stored in the `versionList` property of the latest attachment. 
    * If an attachment has no older versions, it is directly added to the final list.
    *
    * The filtered attachments are then stored in the `filteredCoiAttachmentsList`.
    */
    private filterLatestVersions(): void {
        const ATTACHMENTS_MAP = new Map<number, COIAttachment[]>();
        // Group attachments by attachmentNumber
        this.attachmentLists?.forEach(attachment => {
            const { attachmentNumber } = attachment;
            const attachments = ATTACHMENTS_MAP.get(attachmentNumber) || [];
            attachments.push(attachment);
            ATTACHMENTS_MAP.set(attachmentNumber, attachments);
        });
        // Process the latest versions of each attachment
        this.filteredCoiAttachmentsList = Array.from(ATTACHMENTS_MAP.values()).map(attachments => {
            if (attachments.length > 1) {
                attachments.sort((a: COIAttachment, b: COIAttachment) => b.versionNumber - a.versionNumber);
                const [LATEST_ATTACHMENT, ...OLDER_VERSIONS] = attachments;
                LATEST_ATTACHMENT.versionList = OLDER_VERSIONS.length > 0 ? OLDER_VERSIONS : null;
                return LATEST_ATTACHMENT;
            }
            return attachments[0];
        });
    }

    switchProject(moduleCode: number): void {
        this.currentActiveModuleCode = moduleCode;
        this.filteredProjectsList = this.filterByModuleCode(moduleCode);
        document.getElementById('project-count-modal-table-scroll')?.scroll(0, 0);
    }

    getFormattedPeronUnit(): string {
        return this.commonService.getPersonLeadUnitDetails(this.coiCountModal.personUnit);
    }

    getProjectHeader(): string {
        return this.coiCountModal.projectHeader || `#${this.coiCountModal.projectNumber} - ${this.coiCountModal.projectTitle}`;
    }

    coiCountModalAction(event: ModalActionEvent): void {
        switch (event.action) {
            case 'CLOSE_BTN':
            case 'SECONDARY_BTN': this.closeCoiCountModal();
        }
    }

    closeCoiCountModal(): void {
        closeCommonModal(this.COI_COUNT_MODAL_ID);
        setTimeout(() => {
            this.coiCountModal = new COICountModal();
            this.coiCountModalChange.emit(this.coiCountModal);
            this.countModalClose.emit({ isOpenCountModal: false });
        }, 200);
    }

    viewSliderEmit(isOpenSlider: boolean, entityId: number | string): void {
        this.closeCoiCountModal();
        this.viewSlider.emit({ isOpenSlider, entityId });
    }

    redirectToProjectDetails(projectDetails: CountModalDisclosureProjectData): void {
        const { documentNumber, projectId, projectTypeCode } = projectDetails;
        this.commonService.redirectToProjectDetails(projectTypeCode, (documentNumber || projectId));
    }

    redirectToAttachmentDetails(): void {
        this.commonService.redirectToAttachmentTab(this.coiCountModal, this._router.url);
    }

    downloadAttachment(attachment: COIAttachment): void {
        if (!this.isAttachmentDownloading) {
            this.isAttachmentDownloading = true;
            this.$subscriptions.push(this._coiCountModalService.downloadAwardAttachment(attachment?.attachmentId).subscribe((data: any) => {
                fileDownloader(data, attachment.fileName);
                this.commonService.showToast(HTTP_SUCCESS_STATUS, 'Attachment downloaded successfully');
                this.isAttachmentDownloading = false;
            }, (_err) => {
                this.commonService.showToast(HTTP_ERROR_STATUS, 'Attachment downloading failed.');
                this.isAttachmentDownloading = false;
            }));
        }
    }
}
