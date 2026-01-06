import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {
    ENTITY_COMPLIANCE_RIGHT,
    ENTITY_ORGANIZATION_RIGHT,
    ENTITY_SPONSOR_RIGHT, GLOBAL_ENTITY_COMPLIANCE_SUBMODULE_CODE,
    GLOBAL_ENTITY_MODULE_CODE,
    GLOBAL_ENTITY_ORGANIZATION_SUBMODULE_CODE,
    GLOBAL_ENTITY_SPONSOR_SUBMODULE_CODE,
} from '../../../app-constants';
import {CommonService} from '../../../common/services/common.service';
import {EntityDataStoreService} from '../../entity-data-store.service';
import {DataStoreEvent, EntireEntityDetails} from '../entity-interface';
import {Subscription} from 'rxjs';
import {
    COMPLIANCE_QUESTIONNAIRE,
    COMPLIANCE_QUESTIONNAIRE_SECTION_ID, COMPLIANCE_QUESTIONNAIRE_SUB_SECTION_ID,
    SPONSOR_QUESTIONNAIRE,
    SPONSOR_QUESTIONNAIRE_SECTION_ID, SPONSOR_QUESTIONNAIRE_SUB_SECTION_ID,
    SUB_AWARD_QUESTIONNAIRE,
    SUB_AWARD_QUESTIONNAIRE_SECTION_ID, SUB_AWARD_QUESTIONNAIRE_SUB_SECTION_ID
} from '../entity-constants';
import { EntityManagementService } from '../../entity-management.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { isEmptyObject, deepCloneObject } from '../../../common/utilities/custom-utilities';

@Component({
  selector: 'app-entity-common-questionnaire',
  templateUrl: './entity-common-questionnaire.component.html',
  styleUrls: ['./entity-common-questionnaire.component.scss']
})
export class EntityCommonQuestionnaireComponent implements OnInit, OnDestroy {

    @Input() moduleSubitemCode = 0;
    @Input() sectionName = '';
    @Input() sectionId = '';
    @Input() subSectionId = 0;

    configuration: any = {
        moduleItemCode: GLOBAL_ENTITY_MODULE_CODE,
        moduleSubitemCodes: [],
        moduleItemKey: 0,
        moduleSubItemKey: 0,
        actionUserId: this._commonService.getCurrentUserDetail('personID'),
        actionPersonName: this._commonService.getCurrentUserDetail('fullName'),
        enableViewMode: false,
        isChangeWarning: true,
        isEnableVersion: true,
        isDeleteObsoleteQNR: true
    };
    entityDetails = null;
    isEditMode = false;
    commentCount = 0;
    isShowCommentButton = false;
    isQuestionnaireValidateMode = false;
    sectionToRightsMapping = {
        [SPONSOR_QUESTIONNAIRE_SECTION_ID]: {
            right: ENTITY_SPONSOR_RIGHT,
            subModuleCode: GLOBAL_ENTITY_SPONSOR_SUBMODULE_CODE,
            
        },
        [SUB_AWARD_QUESTIONNAIRE_SECTION_ID]: {
            right: ENTITY_ORGANIZATION_RIGHT,
            subModuleCode: GLOBAL_ENTITY_ORGANIZATION_SUBMODULE_CODE
        },
        [COMPLIANCE_QUESTIONNAIRE_SECTION_ID]: {
            right: ENTITY_COMPLIANCE_RIGHT,
            subModuleCode: GLOBAL_ENTITY_COMPLIANCE_SUBMODULE_CODE
        }
    };
    elementNameMapping = {
        [SPONSOR_QUESTIONNAIRE_SUB_SECTION_ID]: 'coi-sponsor-ques-head-',
        [SUB_AWARD_QUESTIONNAIRE_SUB_SECTION_ID]: 'coi-sub-ques-head-',
        [COMPLIANCE_QUESTIONNAIRE_SUB_SECTION_ID]: 'coi-compl-ques-head-',
    };
    $subscriptions: Subscription[] = [];

    constructor(private _commonService: CommonService, private _dataStoreService: EntityDataStoreService, public entityManagementService: EntityManagementService) {
    }

    ngOnInit(): void {
        this.listenDataChangeFromStore();
        this.getDataFromStore();
        this.setQuestionnaireConfiguration();
        this.isShowCommentButton = this.entityManagementService.checkCommentsRights(this.getSectionDetails(this.sectionId));
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private listenDataChangeFromStore() {
        this.$subscriptions.push(
            this._dataStoreService.dataEvent.subscribe((dependencies: DataStoreEvent) => {
                this.getDataFromStore();
                this.updateQuestionnaireEdit();
            })
        );
    }


    private getDataFromStore(): void {
        const ENTITY_DATA: EntireEntityDetails = this._dataStoreService.getData();
        if (isEmptyObject(ENTITY_DATA)) { return; }
        this.entityDetails = ENTITY_DATA.entityDetails;
        this.commentCount = ENTITY_DATA.commentCountList?.[this.getSectionDetails(this.sectionId)?.sectionTypeCode] || 0;
        this.checkUserHasRight();
    }

    private checkUserHasRight(): void {
        this.isEditMode = this._dataStoreService.getEditMode() && this._commonService.getAvailableRight(this.getTabBasedRights(), 'SOME');
    }

    private getSectionDetails(sectionCode: string | number): any {
        switch (sectionCode) {
            case SUB_AWARD_QUESTIONNAIRE_SECTION_ID: return SUB_AWARD_QUESTIONNAIRE;
            case COMPLIANCE_QUESTIONNAIRE_SECTION_ID: return COMPLIANCE_QUESTIONNAIRE;
            case SPONSOR_QUESTIONNAIRE_SECTION_ID: return SPONSOR_QUESTIONNAIRE;
            default: return;
        }
    }

    setQuestionnaireConfiguration() {
        this.configuration.moduleItemKey = this.entityDetails.entityId;
        this.configuration.moduleSubitemCodes = [this.getSubItemCode()];
        this.configuration.enableViewMode = !this.isEditMode;
        this.refreshQuestionnaireConfiguration();
    }

    updateQuestionnaireEdit() {
        if (this.configuration.enableViewMode === this.isEditMode) {
            this.configuration.enableViewMode = !this.isEditMode;
            this.refreshQuestionnaireConfiguration();
        }
    }

    refreshQuestionnaireConfiguration() {
        this.configuration = deepCloneObject(this.configuration);
    }

    getTabBasedRights() {
        return this.sectionToRightsMapping?.[this.sectionId]?.right || [];
    }

    getSubItemCode() {
        return this.sectionToRightsMapping?.[this.sectionId]?.subModuleCode || null;
    }

    getSaveEvent(event) {
        this._commonService.setChangesAvailable(false);
    }

    markQuestionnaireAsEdited(event) {
        this._commonService.setChangesAvailable(true);
    }

    openReviewComments(): void {
        const SECTION_DETAILS = this.getSectionDetails(this.sectionId);
        this.entityManagementService.openReviewCommentsSlider({
            commentTypeCode: SECTION_DETAILS.commentTypeCode,
            sectionTypeCode: SECTION_DETAILS.sectionTypeCode
        });
    }

}
