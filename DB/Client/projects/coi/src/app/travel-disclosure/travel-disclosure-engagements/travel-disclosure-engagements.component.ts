import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { closeCoiSlider, closeCommonModal, openCoiSlider, openCommonModal } from '../../common/utilities/custom-utilities';
import { TravelDataStoreService } from '../services/travel-data-store.service';
import { TravelDisclosureService } from '../services/travel-disclosure.service';
import { CommonService } from '../../common/services/common.service';
import { CommonModalConfig, ModalActionEvent } from '../../shared-components/common-modal/common-modal.interface';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { TRAVEL_DISCLOSURE_FORM_ROUTE_URL } from '../../app-constants';
import { TRAVEL_DISCLOSURE_EXTERNAL_CONFIRM_TEXT, TRAVEL_DISCLOSURE_EXTERNAL_INFO, TRAVEL_DISCLOSURE_INTERNAL_CONFIRM_TEXT, TRAVEL_DISCLOSURE_INTERNAL_INFO } from '../travel-disclosure-constants';
import { GlobalEventNotifier } from '../../common/services/coi-common.interface';

@Component({
    selector: 'app-travel-disclosure-engagements',
    templateUrl: './travel-disclosure-engagements.component.html',
    styleUrls: ['./travel-disclosure-engagements.component.scss'],
})
export class TravelDisclosureEngagementsComponent implements OnInit, OnDestroy, AfterViewInit {

    selectedFundingType: 'INTERNAL' | 'EXTERNAL' = 'EXTERNAL';
    showSlider = false;
    sliderElementId = '';
    entityDetails: any = {};
    hasDisclosureId = false;
    $subscriptions = [];
    travelDisclosureRO: any = {};
    travelDisclosureId: any = null;
    isExternal = true;
    travelerFundingTypeCode = '';
    TRAVEL_DISCLOSURE_EXTERNAL_INFO = TRAVEL_DISCLOSURE_EXTERNAL_INFO;
    TRAVEL_DISCLOSURE_INTERNAL_INFO = TRAVEL_DISCLOSURE_INTERNAL_INFO;
    TRAVEL_DISCLOSURE_INTERNAL_CONFIRM_TEXT = TRAVEL_DISCLOSURE_INTERNAL_CONFIRM_TEXT;
    TRAVEL_DISCLOSURE_EXTERNAL_CONFIRM_TEXT = TRAVEL_DISCLOSURE_EXTERNAL_CONFIRM_TEXT;
    TRAVEL_MODAL_ID = 'travelCreateConfirmationModalType';
    confimrModalConfig = new CommonModalConfig(this.TRAVEL_MODAL_ID, 'Confirm', 'Cancel');
    travelDisclosureFlowType = {
        EXTERNAL: false,
        INTERNAL: false,
    };

    constructor(private _router: Router,
        private _dataStore: TravelDataStoreService,
        private _route: ActivatedRoute,
        public travel_service: TravelDisclosureService,
        private _commonService: CommonService
    ) { }

    ngOnInit(): void {
        this.travelDisclosureFlowType.EXTERNAL = this._commonService.travelDisclosureFlowType?.toUpperCase()?.includes('EXTERNAL');
        this.travelDisclosureFlowType.INTERNAL = this._commonService.travelDisclosureFlowType?.toUpperCase()?.includes('INTERNAL');
        this.getDataFromStore();
        this.listenQueryParamsChanges();
        this.hasDisclosureId = !!this._route.snapshot.queryParamMap.get('disclosureId');
        this.listenToGlobalNotifier();
        window.scrollTo(0, 0);
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    ngAfterViewInit(): void {
        this._commonService.$globalEventNotifier.next({ uniqueId: 'TRAVEL_DISCLOSURE_ENGAGEMENT_ID', content: { personEntityId: this._dataStore.getData().personEntityId } });
    }

    private listenQueryParamsChanges(): void {
        this.$subscriptions.push(this._route.queryParams.subscribe(params => {
            const MODULE_ID = params['disclosureId'];
            if (!MODULE_ID) {
                this.hasDisclosureId = null;
                this._commonService.$globalEventNotifier.next({ uniqueId: 'TRAVEL_DISCLOSURE_ENGAGEMENT_ID', content: { personEntityId: null } });
                this.selectedFundingType = this.travelDisclosureFlowType.EXTERNAL ? 'EXTERNAL' : this.travelDisclosureFlowType.INTERNAL ? 'INTERNAL' : null;
                this.travel_service.isExternalFundingType.next(this.selectedFundingType === 'EXTERNAL');
            }
        }));
    }

    private getDataFromStore(): void {
        if (this._dataStore.getData().travelDisclosureId) {
            this.travelDisclosureId = this._dataStore.getData().travelDisclosureId;
            this.travelerFundingTypeCode = this._dataStore.getData().travelerFundingTypeCode;
            this.entityDetails = this._dataStore.getTravelEntity();
            this.isExternal = this._dataStore.isExternal();
            this.travel_service.isExternalFundingType.next(this.isExternal);
            this.selectedFundingType = this.isExternal ? 'EXTERNAL' : 'INTERNAL';
        } else {
            this.travel_service.isExternalFundingType.next(true);
        }
    }

    openCreateSFI() {
        this.travel_service.setUnSavedChanges(false, '');
        this._router.navigate(['/coi/create-sfi/create'], { queryParams: { type: 'SFI' } });
    }

    // travelerFundingTypeCode - 2 EXTERNAL.   1 INTERNAL
    toggleFundingType(selectedFundingType: 'INTERNAL' | 'EXTERNAL'): void {
        this.travel_service.isExternalFundingType.next(selectedFundingType === 'EXTERNAL');
        const isInternalSwitch = this.travelerFundingTypeCode === '2' && selectedFundingType === 'INTERNAL';
        const isExternalSwitch = this.travelerFundingTypeCode === '1' && selectedFundingType === 'EXTERNAL';
        this.selectedFundingType = selectedFundingType;
        if (this._dataStore.getData().travelDisclosureId) {
            if (isInternalSwitch || isExternalSwitch) {
                openCommonModal(this.TRAVEL_MODAL_ID);
            }
        }
    }

    viewSlider(event) {
        this.showSlider = event.flag;
        this.sliderElementId = `disclosure-sfi-slider-${this.entityDetails.personEntityId}`;
        openCoiSlider(this.sliderElementId);
    }

    hideSfiNavBar() {
        setTimeout(() => {
            this.showSlider = false;
            this.sliderElementId = '';
        }, 500);
    }

    confirmTravelEngagement() {
        this.travelDisclosureRO.personEntityId = null;
        this.travelDisclosureRO.personEntityNumber = null;
        this.travelDisclosureRO.entityId = null;
        this.travelDisclosureRO.entityNumber = null;
        this.travelDisclosureRO.travelerFundingTypeCode = '1'; // INTERNAL
        this.travelDisclosureRO.travelDisclosureId = parseInt(this.travelDisclosureId) || null;
        this._commonService.$globalEventNotifier.next(
            {
                uniqueId: 'SELECT_ENGAGEMENT_TRAVEL_DISCLOSURE',
                content: this.travelDisclosureRO
            });
    }

    postConfirmation(modalAction: ModalActionEvent) {
        closeCommonModal(this.TRAVEL_MODAL_ID);
        if (modalAction.action === 'PRIMARY_BTN') {
            if (this.selectedFundingType === 'INTERNAL') {
                this.confirmTravelEngagement();
            } else {
                setTimeout(() => {
                    this.selectedFundingType = 'EXTERNAL';
                }, 200);
            }
        } else {
            this._router.navigate([TRAVEL_DISCLOSURE_FORM_ROUTE_URL],
                { queryParams: { disclosureId: this.travelDisclosureId } });
        }
    }

    private listenToGlobalNotifier(): void {
        this.$subscriptions.push(
            this._commonService.$globalEventNotifier.subscribe((event: GlobalEventNotifier) => {
                if (event.uniqueId === 'ENGAGEMENT_VIEW_DISCLOSURE') {
                    sessionStorage.removeItem('engagementTab');
                    closeCoiSlider(this.sliderElementId);
                    this.hideSfiNavBar();
                }
            })
        );
    }
}
