import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonService } from '../../common/services/common.service';
import { TravelDataStoreService } from '../services/travel-data-store.service';
import { fadeInOutHeight } from '../../common/utilities/animations';
import { FBConfiguration } from '../../configuration/form-builder-create/shared/form-builder-view/form-builder-interface';
import { closeCoiSlider, openCoiSlider } from '../../common/utilities/custom-utilities';
import { GlobalEventNotifier } from '../../common/services/coi-common.interface';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';

@Component({
    selector: 'app-travel-disclosure-form',
    templateUrl: './travel-disclosure-updated-form.component.html',
    styleUrls: ['./travel-disclosure-updated-form.component.scss'],
    animations: [fadeInOutHeight]
})
export class TravelDisclosureUpdatedFormComponent implements OnInit, OnDestroy {

    entityDetails: any = {};
    showSlider = false;
    sliderElementId = '';
    fbConfiguration = new FBConfiguration();
    $subscriptions = [];
    isExternal = true;

    constructor(public commonService: CommonService,
        private _dataStore: TravelDataStoreService,
    ) { }

    ngOnInit(): void {
        this.getDataFromStore();
        this.listenToGlobalNotifier();
        window.scrollTo(0, 0);
    }

    private getDataFromStore(): void {
        if (this._dataStore.getData().travelDisclosureId) {
            this.entityDetails = this._dataStore.getTravelEntity();
            this.isExternal = this._dataStore.isExternal();
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

    private listenToGlobalNotifier(): void {
        this.$subscriptions.push(
            this.commonService.$globalEventNotifier.subscribe((event: GlobalEventNotifier) => {
                if (event.uniqueId === 'ENGAGEMENT_VIEW_DISCLOSURE') {
                    sessionStorage.removeItem('engagementTab');
                    closeCoiSlider(this.sliderElementId);
                    this.hideSfiNavBar();
                }
            })
        );
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

}
