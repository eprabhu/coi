import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TravelDataStoreService } from '../../../services/travel-data-store.service';
import { TravelDisclosure, TravelDisclosureTraveller } from '../../../travel-disclosure.interface';
import { subscriptionHandler } from '../../../../../../../fibi/src/app/common/utilities/subscription-handler';
import { closeCoiSlider, getFormattedAmount, openCoiSlider } from '../../../../common/utilities/custom-utilities';
import { Router } from '@angular/router';
import { heightAnimation } from 'projects/coi/src/app/common/utilities/animations';
import { CommonService } from 'projects/coi/src/app/common/services/common.service';
import { GlobalEventNotifier } from 'projects/coi/src/app/common/services/coi-common.interface';

@Component({
    selector: 'app-travel-form-summary',
    templateUrl: './travel-form-summary.component.html',
    styleUrls: ['./travel-form-summary.component.scss'],
    animations: [heightAnimation('0', '*', 400, 'heightAnimation')]
})
export class TravelFormSummaryComponent implements OnInit, OnDestroy {

    isCollapsed = true;
    $subscriptions: Subscription[] = [];
    travellerTypeLookup: Array<TravelDisclosureTraveller>;
    traveller = '';
    isReadMorePurpose = false;
    isReadMoreRelation = false;
    entityDetails: any = {};
    travellerTypeCodeList = [];
    showSlider = false;
    sliderElementId = '';
    isExternal = true;

    constructor(private _dataStore: TravelDataStoreService, private _router: Router, private _commonService: CommonService) { }

    ngOnInit(): void {
        this.getDataFromStore();
        this.listenDataChangeFromStore();
        this.listenToGlobalNotifier();
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private getDataFromStore(): void {
        this.entityDetails = this._dataStore.getTravelEntity();
        this.isExternal = this._dataStore.isExternal();
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this._dataStore.dataEvent.subscribe((dependencies: string[]) => {
                this.getDataFromStore();
            })
        );
    }

    viewEntity(entityId: string): void {
        this._router.navigate(['/coi/entity-management/entity-details'], { queryParams: { entityManageId: entityId } });
    }

    getFormattedAmount(travelAmount: number): string {
        return getFormattedAmount(travelAmount);
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
