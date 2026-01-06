import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {EntityDataStoreService} from '../../entity-data-store.service';
import {CommonService} from '../../../common/services/common.service';
import {Subscription} from 'rxjs';
import {subscriptionHandler} from '../../../common/utilities/subscription-handler';
import {CustomElement} from '../../../shared/custom-element/custom-element.interface';
import {EntityManagementService} from '../../entity-management.service';
import { ADDITIONAL_INFORMATION } from '../../shared/entity-constants';
import { isEmptyObject } from '../../../common/utilities/custom-utilities';

@Component({
    selector: 'app-entity-additional-details',
    templateUrl: './entity-additional-details.component.html',
    styleUrls: ['./entity-additional-details.component.scss']
})
export class EntityAdditionalDetailsComponent implements OnInit, OnDestroy {

    @Input() sectionId: any;
    @Input() sectionName: any;
    @Input() subSectionId: any;

    isEditMode = false;
    entityId = null;
    commentCount = 0;
    canShowLoader = true;
    isShowCommentButton = false;
    $subscriptions: Subscription[] = [];

    constructor(private _dataStoreService: EntityDataStoreService,
                private _commonService: CommonService,
                public entityManagementService: EntityManagementService) {
    }

    ngOnInit() {
        this.getDataFromStore();
        this.listenDataChangeFromStore();
        this.isShowCommentButton = this.entityManagementService.checkCommentsRights(ADDITIONAL_INFORMATION);
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(this._dataStoreService.dataEvent
            .subscribe(() => {
                this.getDataFromStore();
            }));
    }

    private getDataFromStore() {
        const entityData = this._dataStoreService.getData();
        if (isEmptyObject(entityData)) {
            return;
        }
        this.entityId = entityData?.entityDetails?.entityId;
        this.commentCount = entityData.commentCountList?.[ADDITIONAL_INFORMATION.sectionTypeCode] || 0;
        this.isEditMode = this._dataStoreService.getEditMode();
        this.checkUserHasRight();
    }

    checkUserHasRight(): void {
        const hasRight = this._commonService.getAvailableRight(['MANAGE_ENTITY'], 'SOME') && this._dataStoreService.getOverviewEditRight(this.sectionId);
        if (!hasRight) {
            this.isEditMode = false;
        }
    }

    checkIfHasCustomElements(customElements: CustomElement[]) {
        const canShowAdditionalInfo = Boolean(customElements.length);
        this.canShowLoader = !canShowAdditionalInfo;
        this.entityManagementService.$canShowAdditionalInformation.next(canShowAdditionalInfo);
    }

    openReviewComments(): void {
        this.entityManagementService.openReviewCommentsSlider({
            commentTypeCode: ADDITIONAL_INFORMATION.commentTypeCode,
            sectionTypeCode: ADDITIONAL_INFORMATION.sectionTypeCode
        });
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

}
