import { Component, OnInit } from '@angular/core';
import { EntityDataStoreService } from '../entity-data-store.service';
import { CommonService } from '../../common/services/common.service';
import {
    SUB_AWARD_ORGANIZATION_NOTES_RIGHTS,
    SubawardOrganizationTab
} from '../shared/entity-constants';
import { deepCloneObject, isEmptyObject } from 'projects/fibi/src/app/common/utilities/custom-utilities';
import { Subscription } from 'rxjs';
import { EntitySubAwardService, isOrganizationConditionSatisfied } from './entity-subaward.service';
import { EntireEntityDetails, EntityAttachment, EntityDetails, EntityRisk, EntityTabStatus, EntitySectionDetails, SubAwardOrganization, SubAwardOrganizationDetails, SubAwardOrgUpdateClass, DataStoreEvent, CommonNoteInputs } from '../shared/entity-interface';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { COMMON_ERROR_TOAST_MSG, ENTITY_VERIFICATION_STATUS, FEED_STATUS_CODE, HTTP_ERROR_STATUS, NOTES_SECTIONS_LIST } from '../../app-constants';
import { EntityManagementService } from '../entity-management.service';
import { Note } from '../../disclosure/coi-interface';

@Component({
    selector: 'app-entity-subaward',
    templateUrl: './entity-subaward.component.html',
    styleUrls: ['./entity-subaward.component.scss'],
    providers: [EntitySubAwardService]
})
export class EntitySubawardComponent implements OnInit {

    SUB_AWARD_TAB = SubawardOrganizationTab;
    isLoading = true;
    orgDetailsSubSectionId = '';
    orgDetailsSubSectionName = '';
    entityDetails = new EntityDetails();
    $subscriptions: Subscription[] = [];
    entitySubAwardRisksList: EntityRisk[] = [];
    riskSectionDetails = new EntitySectionDetails();
    entitySubAwarAttachmentList: EntityAttachment[] = [];
    attachmentSectionDetails = new EntitySectionDetails();
    questionnaireSectionDetails = new EntitySectionDetails();
    entityTabStatus: EntityTabStatus = new EntityTabStatus();
    notesList: Note[] = [];
    notesSectionInput = new CommonNoteInputs();
    noteSectionDetails = new EntitySectionDetails();
    canShowNotesSection = false;

    constructor(public commonService: CommonService,
        private _dataStoreService: EntityDataStoreService,
        private _entitySubAwardService: EntitySubAwardService,
        private _entityManagementService: EntityManagementService
    ) { }

    ngOnInit() {
        window.scrollTo(0, 0);
        this.setSectionIdAndName();
        this.getDataFromStore();
        this.listenDataChangeFromStore();
        this.fetchNotesList();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    private setSectionIdAndName(): void {
        this.riskSectionDetails.subSectionId = 2613;
        this.attachmentSectionDetails.subSectionId = 2614;
        this.orgDetailsSubSectionId = this.commonService.getSectionId(this.SUB_AWARD_TAB, 'SUB_AWARD_ORGANIZATION');
        this.orgDetailsSubSectionName = this.commonService.getSectionName(this.SUB_AWARD_TAB, 'SUB_AWARD_ORGANIZATION');
        this.attachmentSectionDetails.sectionId = this.commonService.getSectionId(this.SUB_AWARD_TAB, 'SUB_AWARD_ATTACHMENTS');
        this.attachmentSectionDetails.sectionName = this.commonService.getSectionName(this.SUB_AWARD_TAB, 'SUB_AWARD_ATTACHMENTS');
        this.riskSectionDetails.sectionId = this.commonService.getSectionId(this.SUB_AWARD_TAB, 'SUB_AWARD_RISK');
        this.riskSectionDetails.sectionName = this.commonService.getSectionName(this.SUB_AWARD_TAB, 'SUB_AWARD_RISK');
        this.questionnaireSectionDetails.sectionId = this.commonService.getSectionId(this.SUB_AWARD_TAB, 'SUB_AWARD_QUESTIONNAIRE');
        this.questionnaireSectionDetails.sectionName = this.commonService.getSectionName(this.SUB_AWARD_TAB, 'SUB_AWARD_QUESTIONNAIRE');
        this.questionnaireSectionDetails.subSectionId = this.commonService.getSubSectionId(this.SUB_AWARD_TAB, 'SUB_AWARD_QUESTIONNAIRE');
        this.noteSectionDetails.sectionId = this.commonService.getSectionId(this.SUB_AWARD_TAB, 'SUB_AWARD_NOTES');
        this.noteSectionDetails.sectionName = this.commonService.getSectionName(this.SUB_AWARD_TAB, 'SUB_AWARD_NOTES');
    }

    private setNotesSectionInput(): void {
        this.notesSectionInput.entityId = this.entityDetails.entityId;
        this.notesSectionInput.isEditMode = this._dataStoreService.getEditMode() && this.commonService.getAvailableRight(['MANAGE_ENTITY_ORGANIZATION_NOTES'], 'SOME');
        this.notesSectionInput.sectionCode = NOTES_SECTIONS_LIST.SUB_AWARD;
        this.notesSectionInput.sectionId = this.noteSectionDetails.sectionId;
        this.notesSectionInput.sectionName = this.noteSectionDetails.sectionName;
        this.notesList = [...this.notesList];
    }

    private getDataFromStore(): void {
        const ENTITY_DATA: EntireEntityDetails = this._dataStoreService.getData();
        if (isEmptyObject(ENTITY_DATA)) { return; }
        if (this.entityDetails?.entityId != ENTITY_DATA?.entityDetails?.entityId) {
            this.fetchEntityDetails(ENTITY_DATA?.entityDetails?.entityId);
        }
        this.entityDetails = ENTITY_DATA.entityDetails;
        this.entityTabStatus = ENTITY_DATA?.entityTabStatus;
        this.canShowNotesSection = this.commonService.getAvailableRight(SUB_AWARD_ORGANIZATION_NOTES_RIGHTS);
        this.setNotesSectionInput();
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this._dataStoreService.dataEvent.subscribe((dependencies: DataStoreEvent) => {
                this.getDataFromStore();
            }));
    }

    private fetchEntityDetails(entityId: string | number): void {
        this.$subscriptions.push(this._entitySubAwardService.fetchEntitySubawardOrgDetails(entityId).subscribe((data: SubAwardOrganization) => {
            this.entitySubAwardRisksList = data?.entityRisks || [];
            this.entitySubAwarAttachmentList = data?.attachments || [];
            this._entitySubAwardService.entitySubAwardOrganization.entityRisks = data?.entityRisks || [];
            this._entitySubAwardService.entitySubAwardOrganization.attachments = data.attachments || [];
            this._entitySubAwardService.entitySubAwardOrganization.subAwdOrgDetailsResponseDTO = data?.subAwdOrgDetailsResponseDTO ?? new SubAwardOrganizationDetails();
            this.isLoading = false;
            this._entityManagementService.scrollToSavedSection();
        }, (_error: any) => {
            this.isLoading = false;
            this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
        }));
    }

    private updateCompleteFlag(): void {
        this.entityTabStatus.entity_sub_org_info = isOrganizationConditionSatisfied(this._entitySubAwardService.entitySubAwardOrganization);
        this._dataStoreService.updateStore(['entityTabStatus'], { 'entityTabStatus': this.entityTabStatus });
    }

    private fetchNotesList(): void {
        if(this.canShowNotesSection) {
            this.$subscriptions.push(this._entityManagementService.fetchOverviewNotes(NOTES_SECTIONS_LIST.SUB_AWARD ,this.entityDetails.entityId).subscribe((data: any) => {
                this.notesList = [...data];
            }));
        }
    }

    riskUpdated(entitySubAwardRisksList: EntityRisk[]): void {
        this.entitySubAwardRisksList = deepCloneObject(entitySubAwardRisksList);
        this._entitySubAwardService.entitySubAwardOrganization.entityRisks = this.entitySubAwardRisksList;
        this.updateCompleteFlag();
        this.updateFeedStatus();
    }

    updateFeedStatus() {
        if (this.entityDetails.entityStatusTypeCode === ENTITY_VERIFICATION_STATUS.VERIFIED && isOrganizationConditionSatisfied(this._entitySubAwardService.entitySubAwardOrganization)) {
            const SUBAWARD_REQ_OBJ: SubAwardOrgUpdateClass = { entityId: this.entityDetails?.entityId, subAwardOrgFields: { feedStatusCode: FEED_STATUS_CODE.READY_TO_FEED }, isChangeInAddress: false };
            this.$subscriptions.push(this._entitySubAwardService.updateOrganizationDetails(SUBAWARD_REQ_OBJ).subscribe((data: string) => {
                this._dataStoreService.updateFeedStatus(this.entityTabStatus, 'ORG');
            }, err => { this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG); }
            ));
        }
    }

}
