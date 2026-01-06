import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { CommonService } from '../../../common/services/common.service';
import { EntityDetailsService } from '../entity-details.service';
import { FCOI_PROJECT_DISCLOSURE_RIGHTS, OPA_DISCLOSURE_RIGHTS, RELATIONSHIP_DETAILS_SECTION_NAME, RELATIONSHIP_QUESTIONNAIRE_SECTION_NAME, TRAVEL_DISCLOSURE_RIGHTS } from '../../../app-constants';
import { COMMITMENT_DIS_TYPE, COMMITMENT_QUES_MODULE_ITEM_KEY, CONSULTING_DIS_TYPE, CONSULTING_QUES_MODULE_ITEM_KEY, TRAVEL_DIS_TYPE, TRAVEL_QUES_MODULE_ITEM_KEY } from '../engagement-interface';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';

@Component({
    selector: 'app-entity-questionnaire',
    templateUrl: './entity-questionnaire.component.html',
    styleUrls: ['./entity-questionnaire.component.scss']
})
export class EntityQuestionnaireComponent implements OnInit, OnDestroy {

    $subscriptions: Subscription[] = [];
    @Input() isEditMode;
    @Input() relationshipDetails;
    @Input() entityId: any;
    @Output() deleteRelationshipEvent: EventEmitter<any> = new EventEmitter<any>();
    @Output() positionsToView: EventEmitter<boolean> = new EventEmitter<boolean>();
    configuration: any = {
        moduleItemCode: 8, //8 - COI disclosure module code
        moduleSubitemCodes: [801], //801 - COI sfi code
        moduleItemKey: '',
        moduleSubItemKey: '',
        actionUserId: this._commonService.getCurrentUserDetail('personID'),
        actionPersonName: this._commonService.getCurrentUserDetail('fullName'),
        enableViewMode: false,
        isChangeWarning: true,
        isEnableVersion: true,
    };
    $externalSaveEvent = new BehaviorSubject<Boolean>(null);
    hasPermissionToView = true;
    deleteHelpText = 'You are about to delete entity relationship.';

    constructor(private _commonService: CommonService, public entityDetailsServices: EntityDetailsService) { }

    ngOnInit() {
        this.openRelationshipQuestionnaire();
    }

    ngOnChanges() {
        this.configuration.enableViewMode = !this.isEditMode;
        this.canScrollToPosition();
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    canScrollToPosition() {
        (this.isEditMode && this.entityDetailsServices.definedRelationships.length > 0) ? this.positionsToView.emit(true) : this.positionsToView.emit(false);
    }

    getQuestionnaire(data: any) {
        this.entityDetailsServices.toBeActiveTab = 'QUESTIONNAIRE';
        if(this._commonService.isUnifiedQuestionnaireEnabled) {
            this.entityDetailsServices.activeRelationship = data.disclosureTypeCode;
            if ((this.relationshipDetails && this.relationshipDetails.personId === this._commonService.getCurrentUserDetail('personID')) || this.hasRightToView(data.validPersonEntityRelType.disclosureTypeCode)) {
                this.hasPermissionToView = true;
                this.configuration.moduleItemKey = this.entityId;
                switch(data.disclosureTypeCode) {
                    case TRAVEL_DIS_TYPE : {
                        this.configuration.moduleSubItemKey = TRAVEL_QUES_MODULE_ITEM_KEY;
                        break;
                    }
                    case COMMITMENT_DIS_TYPE : {
                        this.configuration.moduleSubItemKey = COMMITMENT_QUES_MODULE_ITEM_KEY;
                        break;
                    }
                    case CONSULTING_DIS_TYPE : {
                        this.configuration.moduleSubItemKey = CONSULTING_QUES_MODULE_ITEM_KEY;
                        break;
                    }
                    default :
                        break;
                }
                this.configuration = Object.assign({}, this.configuration);
            } else {
                this.hasPermissionToView = false;
            }
        } else {
            if (data) {
                this.entityDetailsServices.activeRelationship = data.validPersonEntityRelType.validPersonEntityRelTypeCode;
                if ((this.relationshipDetails && this.relationshipDetails.personId === this._commonService.getCurrentUserDetail('personID')) || this.hasRightToView(data.validPersonEntityRelType.disclosureTypeCode)) {
                    this.hasPermissionToView = true;
                    this.configuration.moduleItemKey = this.entityId;
                    this.configuration.moduleSubItemKey = data.validPersonEntityRelTypeCode;
                    this.configuration = Object.assign({}, this.configuration);
                } else {
                    this.hasPermissionToView = false;
                }
        }
        }
    }

    hasRightToView(disclosureTypeCode) {
        switch (disclosureTypeCode) {
            case '1':
                return this._commonService.getAvailableRight(FCOI_PROJECT_DISCLOSURE_RIGHTS);
            case '2':
                return this._commonService.getAvailableRight(OPA_DISCLOSURE_RIGHTS);
            case '3':
                return this._commonService.getAvailableRight(TRAVEL_DISCLOSURE_RIGHTS);
        }
    }

    openRelationshipQuestionnaire() {
        this.$subscriptions.push(this.entityDetailsServices.$openQuestionnaire.subscribe((data: any) => {
            if (data) {
                this.entityDetailsServices.isRelationshipQuestionnaireChanged ? this.leaveCurrentRelationship(data) : this.getQuestionnaire(data);
            }
        }));
    }

    leaveCurrentRelationship(data: any) {
        this.entityDetailsServices.$emitUnsavedChangesModal.next({ details: data, isLeaveFromRelationTab: true });
    }

    questionnaireSaveAction(event) {
        this.entityDetailsServices.$saveQuestionnaireAction.next(event);
    }

    questionnaireEdit(event: any) {
        if (!event) return;
        this.entityDetailsServices.isRelationshipQuestionnaireChanged = true;
        const { activeRelationship, unSavedSections, selectedDisclosureTypes, definedRelationships } = this.entityDetailsServices;
        const selectedType = this._commonService.isUnifiedQuestionnaireEnabled
            ? selectedDisclosureTypes?.find(ele => ele.disclosureTypeCode === activeRelationship)?.coiDisclosureType?.description
            : definedRelationships?.find(ele => ele.validPersonEntityRelType?.validPersonEntityRelTypeCode === activeRelationship)?.validPersonEntityRelType?.description;
        if (selectedType && !unSavedSections?.some(ele => ele.includes(RELATIONSHIP_QUESTIONNAIRE_SECTION_NAME))) {
            unSavedSections.push(`${selectedType} ${RELATIONSHIP_QUESTIONNAIRE_SECTION_NAME}`);
        }
    }

    canShowQuestionnaire() {
        return ((this._commonService.isUnifiedQuestionnaireEnabled && this.entityDetailsServices.selectedDisclosureTypes.length) || (!this._commonService.isUnifiedQuestionnaireEnabled && this.entityDetailsServices.definedRelationships.length))
    }

}
