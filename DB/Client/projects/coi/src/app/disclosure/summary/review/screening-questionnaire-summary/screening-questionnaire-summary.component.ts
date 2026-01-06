import { Component, DoCheck, OnDestroy, OnInit } from '@angular/core';

import { environment } from '../../../../../environments/environment';
import { COI, CommentConfiguration } from '../../../coi-interface';
import { CoiSummaryEventsAndStoreService } from '../../services/coi-summary-events-and-store.service';
import {CommonService} from "../../../../common/services/common.service";
import { Subscription } from 'rxjs';
import { CoiService } from '../../../services/coi.service';
import { subscriptionHandler } from '../../../../../../../fibi/src/app/common/utilities/subscription-handler';
import { DataStoreService } from '../../../services/data-store.service';
import { EXTERNAL_QUESTIONAIRE_MODULE_SUB_ITEM_CODE } from '../../../../../app/app-constants';
import { isEmptyObject } from '../../../../common/utilities/custom-utilities';
import { FetchReviewCommentRO } from '../../../../shared-components/coi-review-comments-slider/coi-review-comments-slider.interface';
import { COIReviewCommentsConfig } from '../../../../shared-components/coi-review-comments/coi-review-comments.interface';
import { FCOI_QUESTIONNAIRE_COMMENTS } from '../../../../shared-components/coi-review-comments/coi-review-comments-constants';
import { DataStoreEvent } from '../../../../common/services/coi-common.interface';

@Component({
    selector: 'app-screening-questionnaire-summary',
    templateUrl: './screening-questionnaire-summary.component.html',
    styleUrls: ['./screening-questionnaire-summary.component.scss']
})
export class ScreeningQuestionnaireSummaryComponent implements OnInit, DoCheck, OnDestroy {

    configuration: any = {
        moduleItemCode: 8,
        moduleSubitemCodes: [0, EXTERNAL_QUESTIONAIRE_MODULE_SUB_ITEM_CODE],
        moduleItemKey: '',
        moduleSubItemKey: 0,
        actionUserId: this._commonService.getCurrentUserDetail('personID'),
        actionPersonName: this._commonService.getCurrentUserDetail('fullName'),
        enableViewMode: [0, EXTERNAL_QUESTIONAIRE_MODULE_SUB_ITEM_CODE],
        isChangeWarning: true,
        isEnableVersion: true,
    };
    deployMap = environment.deployUrl;
    commentConfiguration: CommentConfiguration = new CommentConfiguration();
    $subscriptions: Subscription[] = [];
    activeQuestionnaire: any = null;
    isQuestionnaireCollapsed = false;
    coiData = new COI();
    questionnaireCommentCount: number;
    isShowCommentButton = false;

    constructor(public coiService: CoiService,
                private _dataStore: DataStoreService,
                private _commonService: CommonService,
                private _dataStoreAndEventsService: CoiSummaryEventsAndStoreService
    ) { }

    ngOnInit() {
        this.configuration.moduleItemKey = this._dataStoreAndEventsService.coiSummaryConfig.currentDisclosureId;
        this.commentConfiguration.disclosureId = this._dataStoreAndEventsService.coiSummaryConfig.currentDisclosureId;
        this.commentConfiguration.coiSectionsTypeCode = 1;
        this.configuration = Object.assign({}, this.configuration);
        setTimeout(() => {
            window.scrollTo(0,0);
        });
        this.getDataFromStore();
        this.listenDataChangeFromStore();
    }

    ngDoCheck() {
        const EXPORT_OPTIONS = document.querySelector('span.exportButton') as HTMLElement;
        if (EXPORT_OPTIONS) {
            EXPORT_OPTIONS.style.visibility = 'hidden';
        }
    }

    ngOnDestroy() {
     subscriptionHandler(this.$subscriptions);
    }

    modifyReviewComment() {
        const COI_DATA = this._dataStore.getData();
        const REQ_BODY: FetchReviewCommentRO = {
            componentTypeCode: FCOI_QUESTIONNAIRE_COMMENTS?.commentTypeCode,
            moduleItemKey: COI_DATA?.coiDisclosure?.disclosureId,
            moduleItemNumber: COI_DATA?.coiDisclosure?.disclosureNumber,
            subModuleCode: null,
            subModuleItemKey: this.activeQuestionnaire?.QUESTIONNAIRE_ID,
            subModuleItemNumber: null,
            isSectionDetailsNeeded: true,
            documentOwnerPersonId: COI_DATA?.coiDisclosure?.person?.personId,
        }
        const REVIEW_COMMENTS_CARD_CONFIG: Partial<COIReviewCommentsConfig> = {
            moduleSectionDetails: {
                sectionId:this.activeQuestionnaire?.QUESTIONNAIRE_ID,
                sectionName: this.activeQuestionnaire?.QUESTIONNAIRE,
                sectionKey: this.activeQuestionnaire?.QUESTIONNAIRE_ID + this.activeQuestionnaire?.QUESTIONNAIRE
            },
            componentDetails: {
                componentName: FCOI_QUESTIONNAIRE_COMMENTS?.componentName,
                componentTypeCode: FCOI_QUESTIONNAIRE_COMMENTS?.commentTypeCode
            }
        }
        this.coiService.setReviewCommentSliderConfig(REQ_BODY, REVIEW_COMMENTS_CARD_CONFIG);
    }

    setActiveQuestionnaire(event) {
        this.activeQuestionnaire = event;
        this.getQuestionnaireCommentCount(this.activeQuestionnaire?.QUESTIONNAIRE_ID);
    }

    private getDataFromStore() {
        const coiData = this._dataStore.getData();
        if (isEmptyObject(coiData)) { return; }
        this.coiData = coiData;
        this.isShowCommentButton = this._dataStore.getCommentButtonVisibility();
    }

    private listenDataChangeFromStore() {
        this.$subscriptions.push(
            this._dataStore.dataEvent.subscribe((data: DataStoreEvent) => {
                this.getDataFromStore();
                this.getQuestionnaireCommentCount(this.activeQuestionnaire?.QUESTIONNAIRE_ID);

            })
        );
    } 
    
    private getQuestionnaireCommentCount(subModuleItemKey: any): void {
        const reviewComments = this.coiData?.disclosureCommentsCount?.reviewCommentsCount || [];
        const QUESTIONNAIRE_COMMENT_DETAILS = reviewComments.find(item => String(item.subModuleItemKey) === String(subModuleItemKey));
        this.questionnaireCommentCount = QUESTIONNAIRE_COMMENT_DETAILS?.count ?? 0;
    }

}
