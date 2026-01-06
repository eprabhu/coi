import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { CoiSummaryEventsAndStoreService } from '../../services/coi-summary-events-and-store.service';
import { COI, CommentConfiguration, DisclosureCommentCountDetails } from '../../../coi-interface';
import { CommonService } from '../../../../common/services/common.service';
import { FetchEachOrAllEngagementsRO, GlobalEventNotifier } from '../../../../common/services/coi-common.interface';
import { subscriptionHandler } from '../../../../common/utilities/subscription-handler';
import { CoiService } from '../../../services/coi.service';
import { DataStoreService } from '../../../services/data-store.service';
import { isEmptyObject } from '../../../../common/utilities/custom-utilities';
import { HTTP_ERROR_STATUS } from '../../../../app-constants';
import { FetchReviewCommentRO } from '../../../../shared-components/coi-review-comments-slider/coi-review-comments-slider.interface';
import { COIReviewCommentsConfig } from '../../../../shared-components/coi-review-comments/coi-review-comments.interface';
import { FCOI_ENGAGEMENT_COMMENTS } from '../../../../shared-components/coi-review-comments/coi-review-comments-constants';

@Component({
    selector: 'app-sfi-summary',
    templateUrl: './sfi-summary.component.html',
    styleUrls: ['./sfi-summary.component.scss'],
})
export class SfiSummaryComponent implements OnInit, OnDestroy {

    @ViewChild('viewSFISummaryDetailsOverlay', { static: true }) viewSFISummaryDetailsOverlay: ElementRef;
    coiFinancialEntityDetails: any[] = [];
    $subscriptions: Subscription[] = [];
    deployMap = environment.deployUrl;
    commentConfiguration: CommentConfiguration = new CommentConfiguration();
    coiDetails: any = {};
    searchText: string;
    showSlider = false;
    isLoading = false;
    sliderElementId = '';
    coiData = new COI();
    isShowCommentButton = false;
    isShowEngagementRisk = false;
    commentCount: DisclosureCommentCountDetails[] = [];

    constructor(public coiService: CoiService,
                private _dataStore: DataStoreService,
                private _commonService :CommonService,
                private _dataStoreAndEventsService: CoiSummaryEventsAndStoreService
    ) { }

    ngOnInit() {
        this.listenGlobalEventNotifier();
        this.fetchCOIDetails();
        this.getSfiDetails();
        this.getDataFromStore();
        this.listenDataChangeFromStore();
        this.commentConfiguration.coiSectionsTypeCode = 2;
        this.commentConfiguration.disclosureId = this._dataStoreAndEventsService.coiSummaryConfig.currentDisclosureId;
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    private fetchCOIDetails(): void {
        this.coiDetails = this._dataStoreAndEventsService.getData(
            this._dataStoreAndEventsService.coiSummaryConfig.currentDisclosureId,
            ['coiDisclosure']
        ).coiDisclosure;
    }

    private listenGlobalEventNotifier(): void {
        this.$subscriptions.push(
            this._commonService.$globalEventNotifier.subscribe((event: GlobalEventNotifier) => {
                if (event?.uniqueId === 'TRIGGER_DISCLOSURE_PARAM_CHANGE' && event?.content?.disclosureType === 'FCOI' && event?.content?.coiData) {
                    this.fetchCOIDetails();
                    this.getSfiDetails();
                }
            })
        );
    }

    getSfiDetails() {
        this.isLoading = false;
        this.$subscriptions.push(this._commonService.fetchEachOrAllEngagements(this.getRequestObject()).subscribe((data: any) => {
            if (data) {
                this.isLoading = true;
                this.coiFinancialEntityDetails = data.personEntities || [];
                this._dataStore.updateStore(['coiFinancialEntityDetails'], { coiFinancialEntityDetails: this.coiFinancialEntityDetails });
                this.setSubSectionList();
                this.updateCommentCount(this.commentCount);
            }
        }, (_error: any) => {
            this.isLoading = true;
            this._commonService.showToast(HTTP_ERROR_STATUS, 'Fetching Engagements list failed. Please try again.');
        }));
    }

    getRequestObject() {
		const REQ_OBJ = new FetchEachOrAllEngagementsRO();
        REQ_OBJ.currentPage = 0;
        REQ_OBJ.disclosureId = Number(this.coiDetails.disclosureId);
        REQ_OBJ.filterType = '';
        REQ_OBJ.pageNumber = 0;
        REQ_OBJ.personId = this.coiDetails.personId;
        REQ_OBJ.reviewStatusCode = '';
        REQ_OBJ.searchWord = '';
        REQ_OBJ.sortType = 'COMPLETE_TO_INACTIVE';
        return REQ_OBJ;
    }

    setSubSectionList() {
        this.commentConfiguration.subSectionList = this.coiFinancialEntityDetails.map(ele => {
            return {
                coiSubSectionsCode: ele.coiFinancialEntityId,
                description: ele.coiEntity.coiEntityName,
                coiEntity: ele.coiEntity
            };
        });
    }

    openEngagementSlider(event: any): void {
        this.coiService.openEngagementSlider(event.entityId);
    }

    openReviewerComment(event) {
        const COI_DATA = this._dataStore.getData();
         const REQ_BODY: FetchReviewCommentRO = {
            componentTypeCode: FCOI_ENGAGEMENT_COMMENTS?.commentTypeCode,
            moduleItemKey: COI_DATA?.coiDisclosure?.disclosureId,
            moduleItemNumber: COI_DATA?.coiDisclosure?.disclosureNumber,
            subModuleCode: null,
            subModuleItemKey: event?.personEntityId,
            subModuleItemNumber: event?.personEntityNumber,
            isSectionDetailsNeeded: true,
            documentOwnerPersonId: COI_DATA?.coiDisclosure?.person?.personId,
        }
        const REVIEW_COMMENTS_CARD_CONFIG: Partial<COIReviewCommentsConfig> = {
            moduleSectionDetails: {
                sectionId: event?.personEntityId,
                sectionName: event?.personEntityHeader,
                sectionKey: event?.personEntityId + event?.personEntityHeader
            },
            componentDetails: {
                componentName: FCOI_ENGAGEMENT_COMMENTS?.componentName,
                componentTypeCode: FCOI_ENGAGEMENT_COMMENTS?.commentTypeCode
            }
        }
        this.coiService.setReviewCommentSliderConfig(REQ_BODY, REVIEW_COMMENTS_CARD_CONFIG);
    }

    private getDataFromStore(): void {
        const COI_DATA = this._dataStore.getData();
        if (isEmptyObject(COI_DATA)) { return; }
        this.coiData = COI_DATA;
        this.isShowEngagementRisk = this._dataStore.isShowEngagementRisk;
        this.isShowCommentButton = this._dataStore.getCommentButtonVisibility();
        this.commentCount = COI_DATA?.disclosureCommentsCount?.reviewCommentsCount;
        this.updateCommentCount(this.commentCount);
    }

    private updateCommentCount(commentsCount: DisclosureCommentCountDetails[]): void {
        this.coiFinancialEntityDetails?.forEach(entity => {
            const ENTITY_DETAILS = commentsCount?.find(item => String(item?.subModuleItemNumber) === String(entity?.personEntityNumber));
            entity.commentDetails = {
                isShowComment: this.isShowCommentButton,
                entityCommentCount: ENTITY_DETAILS ? ENTITY_DETAILS.count : 0
            };
        });
    }
    
    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this._dataStore.dataEvent.subscribe(() => {
                this.getDataFromStore();
            })
        );
    }

}
