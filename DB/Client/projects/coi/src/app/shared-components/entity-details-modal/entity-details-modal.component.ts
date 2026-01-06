import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { EntityDetailsModalService } from './entity-details-modal.service';
import { Subscription } from 'rxjs';
import { COIEntityModalConfig } from '../../common/services/coi-common.interface';
import { CommonService } from '../../common/services/common.service';
import { COMMON_ERROR_TOAST_MSG, ENTITY_MODAL_DETAILS_CARD_ORDER, ENTITY_RIGHTS, HTTP_ERROR_STATUS } from '../../app-constants';
import { EntireEntityDetails, EntityDetails } from '../../entity-management-module/shared/entity-interface';
import { combineAddress, openInNewTab } from '../../common/utilities/custom-utilities';
import { ENTITY_VERSION_STATUS } from '../../entity-management-module/shared/entity-constants';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';

@Component({
    selector: 'app-entity-details-modal',
    templateUrl: './entity-details-modal.component.html',
    styleUrls: ['./entity-details-modal.component.scss'],
    providers: [EntityDetailsModalService]
})
export class EntityDetailsModalComponent implements OnInit, OnDestroy {

    @Input() entityModalConfig = new COIEntityModalConfig();
    $subscriptions: Subscription[] = [];
    entityDetails = new EntityDetails();
    entireEntityData = new EntireEntityDetails();
    entityCardOrder = ENTITY_MODAL_DETAILS_CARD_ORDER;
    showForeignName: boolean[] = [];
    isExpandForeignName = false;
    primaryAddress = '';
    isEnableGraph = false;
    hasEntityRights = false
    activeVersion = ENTITY_VERSION_STATUS.ACTIVE;
    activeEntityDetails: any;
    @HostListener('document:keydown.escape', ['$event'])
    handleEscapeEvent(event: any): void {
        if ((event.key === 'Escape' || event.key === 'Esc')) {
            document.getElementById('coi-entity-view-modal-close-btn')?.click();
        }
    }

    constructor(private _entityDetailsModalService: EntityDetailsModalService, public commonService: CommonService) { }

    ngOnInit() {
        this.getEntityDetails();
        this.isEnableGraph = this.commonService.enableGraph;
        this.hasEntityRights = this.commonService.getAvailableRight(ENTITY_RIGHTS);
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private getEntityDetails(): void {
        this.$subscriptions.push(this._entityDetailsModalService.getEntityDetails(this.entityModalConfig?.entityId).subscribe((data: EntireEntityDetails) => {
            this.entireEntityData = data;
            this.entityDetails = data.entityDetails;
            this.getAllEntityVersion(this.entityDetails?.entityNumber);
            this.primaryAddress = combineAddress(this.entityDetails?.primaryAddressLine1, this.entityDetails?.primaryAddressLine2);
            document.getElementById('coi-entity-view-modal-trigger-btn')?.click();
        },
        (error: any) => {
            this.clearModalDataAndShowToast();
        }));
    }

    private clearModalDataAndShowToast(): void {
        this.commonService.entityModalConfig = new COIEntityModalConfig();
        this.commonService.showToast(HTTP_ERROR_STATUS, COMMON_ERROR_TOAST_MSG);
    }

    private getAllEntityVersion(entityNumber: number | string): void {
        this.$subscriptions.push(this._entityDetailsModalService.getAllEntityVersion(entityNumber).subscribe((entityVersionList: any[]) => {
            this.activeEntityDetails = entityVersionList?.find((entityVersions) => entityVersions?.versionStatus === this.activeVersion);
        }, (error) => {
            this.commonService.showToast(HTTP_ERROR_STATUS, 'Error in fetching entity version');
        }));
    }

    openGraph(entityName) {
        document.getElementById('coi-entity-view-modal-dissmiss-btn')?.click();
        setTimeout(() => {
            this.entityModalConfig.isOpenModal = false;
            const TRIGGERED_FROM = 'ENTITY_DETAILS_MODAL';
            this.commonService.openEntityGraphModal(this.activeEntityDetails?.entityId, entityName, TRIGGERED_FROM);
        }, 250);
    }

    openWebsite(url: string): void {
        const FINAL_URL = url.includes('http') ? url : '//' + url;
        window.open(FINAL_URL, '_blank');
    }
}
