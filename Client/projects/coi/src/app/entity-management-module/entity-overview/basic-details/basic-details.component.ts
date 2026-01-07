import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DataStoreEvent, EntireEntityDetails, EntityDetails, EntityTabStatus } from '../../shared/entity-interface';
import { EntityDataStoreService } from '../../entity-data-store.service';
import { forkJoin, Subscription } from 'rxjs';
import {CommonService} from '../../../common/services/common.service';
import { ENTITY_VERIFICATION_STATUS, HTTP_ERROR_STATUS } from '../../../app-constants';
import { deepCloneObject, isEmptyObject } from '../../../common/utilities/custom-utilities';
import { EntityCreationConfig } from '../../../common/services/coi-common.interface';
import { EntityManagementService } from '../../entity-management.service';
import { BASIC_DETAILS, COUNTRY_CODE_FOR_MANDATORY_CHECK, ENTITY_MANDATORY_FIELDS, ENTITY_MANDATORY_WITHOUT_ADDRESS } from '../../shared/entity-constants';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';

@Component({
  selector: 'app-basic-details',
  templateUrl: './basic-details.component.html',
  styleUrls: ['./basic-details.component.scss']
})
export class BasicDetailsComponent implements OnInit, OnDestroy {

    @Input() sectionName: any;
    @Input() sectionId: any;

    commentCount = 0;
    isShowCommentButton = false;
    $subscriptions: Subscription[] = [];
    entityDetails = new EntityDetails();
    entityCreationConfig = new EntityCreationConfig();
    entityTabStatus = new EntityTabStatus();

    constructor(public dataStore: EntityDataStoreService, private _commonService: CommonService, public entityManagementService: EntityManagementService) {}

    ngOnInit(): void {
        this.entityCreationConfig.isCreateView = false;
        this.getDataFromStore(true);
        this.listenDataChangeFromStore();
        this.isShowCommentButton = this.entityManagementService.checkCommentsRights(BASIC_DETAILS);
    }

    private getDataFromStore(canUpdateEntity: boolean = false) {
        const ENTIRE_ENTITY_DETAILS: EntireEntityDetails = this.dataStore.getData();
        if (isEmptyObject(ENTIRE_ENTITY_DETAILS)) { return; }
        this.entityDetails = ENTIRE_ENTITY_DETAILS.entityDetails;
        this.entityTabStatus = ENTIRE_ENTITY_DETAILS?.entityTabStatus;
        this.checkUserHasRight();
        this.commentCount = ENTIRE_ENTITY_DETAILS.commentCountList?.[BASIC_DETAILS.sectionTypeCode] || 0;
        const { countryCode: COUNTRY_CODE, countryTwoCode: COUNTRY_TWO_CODE } = this.entityDetails?.country || {};
        this.entityCreationConfig.entityMailingAddresses = ENTIRE_ENTITY_DETAILS?.entityMailingAddresses;
        this.entityCreationConfig.entityDetails = deepCloneObject(this.entityDetails);
        this.entityCreationConfig.dataType = canUpdateEntity ? 'MANUAL_UPDATE' : 'DATA_STORE_CHANGE';
        this.entityCreationConfig.modificationIsInProgress = ENTIRE_ENTITY_DETAILS?.modificationIsInProgress;
        this.entityCreationConfig.isDunsMatchedOnActiveVersion = ENTIRE_ENTITY_DETAILS?.isDunsMatchedOnActiveVersion;
        this.entityCreationConfig.isDunsMatchedOnSelectedVersion = ENTIRE_ENTITY_DETAILS?.entityDetails?.isDunsMatched;
        this.entityCreationConfig.mandatoryFieldsList = (COUNTRY_CODE_FOR_MANDATORY_CHECK.includes(COUNTRY_CODE) ||  COUNTRY_CODE_FOR_MANDATORY_CHECK.includes(COUNTRY_TWO_CODE)) 
        ? ENTITY_MANDATORY_FIELDS
        : ENTITY_MANDATORY_WITHOUT_ADDRESS;
        this.entityCreationConfig = { ...this.entityCreationConfig };
        setTimeout(() => {
            if (canUpdateEntity && this.dataStore.getEditMode()) {
                this.entityManagementService.triggerEntityMandatoryValidation();
            }
        }, 50);
    }

    private listenDataChangeFromStore() {
        this.$subscriptions.push(
            this.dataStore.dataEvent.subscribe((dependencies: DataStoreEvent) => {
                this.getDataFromStore(dependencies.action === 'REFRESH');
            })
        );
    }

    updateStoreData(event) {
        if (event?.autoSaveRO && !isEmptyObject(event?.autoSaveRO)) {
            Object.keys(event?.autoSaveRO).forEach((ele) => {
                this.entityDetails[ele] = event?.autoSaveRO[ele];
            });
            this.dataStore.updateStore(['entityDetails'], { 'entityDetails':  this.entityDetails });
            this.updateSponsorOrgFeed(this.entityDetails?.entityId, event?.autoSaveRO);
        }
        if (event?.entityMailingAddresses) {
            this.dataStore.updateStore(['entityMailingAddresses'], {'entityMailingAddresses': event.entityMailingAddresses});
        }
        this.dataStore.enableModificationHistoryTracking();
    }

    updateSponsorOrgFeed(entityId, reqObj) {
        const FEED_API_CALLS = this.dataStore.getApiCalls(entityId, reqObj);
        if (FEED_API_CALLS.length && this.entityDetails.entityStatusType.entityStatusTypeCode == ENTITY_VERIFICATION_STATUS.VERIFIED) {
            this.$subscriptions.push(forkJoin(FEED_API_CALLS).subscribe((data: [] = []) => {
                    this.dataStore.updateFeedStatus(this.entityTabStatus, 'BOTH');
                }, err => {
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in updating feed status.');
                }
            ));
        }
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    checkUserHasRight(): void {
        this.entityCreationConfig.isEditMode = this.dataStore.getEditMode() && this._commonService.getAvailableRight(['MANAGE_ENTITY'], 'SOME') &&
            this.dataStore.getOverviewEditRight(this.sectionId);
    }

    openReviewComments(): void {
        this.entityManagementService.openReviewCommentsSlider({
            commentTypeCode: BASIC_DETAILS.commentTypeCode,
            sectionTypeCode: BASIC_DETAILS.sectionTypeCode
        });
    }
}
