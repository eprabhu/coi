import { Component, OnDestroy, OnInit } from '@angular/core';
import { TravelDataStoreService } from '../services/travel-data-store.service';
import { TravelDisclosure, TravelHistoryRO, TravelHistory } from '../travel-disclosure.interface';
import { subscriptionHandler } from '../../../../../fibi/src/app/common/utilities/subscription-handler';
import { Subscription } from 'rxjs';
import { TravelDisclosureService } from '../services/travel-disclosure.service';
import { HTTP_ERROR_STATUS } from '../../app-constants';
import { CommonService } from '../../common/services/common.service';
import { Router } from '@angular/router';
import { fadeInOutHeight, listAnimation } from '../../common/utilities/animations';
import { getFormattedAmount, openCoiSlider, openInNewTab } from '../../common/utilities/custom-utilities';

@Component({
    selector: 'app-travel-related-disclosures',
    templateUrl: './travel-related-disclosures.component.html',
    styleUrls: ['./travel-related-disclosures.component.scss'],
    animations: [listAnimation, fadeInOutHeight]
})
export class TravelRelatedDisclosureComponent implements OnInit, OnDestroy {

    isLoading = false;
    historyData: Array<any> = [];
    travelDisclosure = new TravelDisclosure();
    entityDetails: any = {};
    $subscriptions: Subscription[] = [];
    showSlider = false;
    sliderElementId = '';
    firstStayEndDate = null;
    lastStayEndDate = null;
    isExternal = true;

    constructor(
        private _dataStore: TravelDataStoreService,
        private _service: TravelDisclosureService,
        private _commonService: CommonService,
        private _router: Router
    ) { }

    ngOnInit(): void {
        this.getDataFromStore();
        this.listenDataChangeFromStore();
        window.scrollTo(0, 0);
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private getDataFromStore(): void {
        this.travelDisclosure = this._dataStore.getData();
        this.entityDetails = this._dataStore.getTravelEntity();
        this.isExternal = this._dataStore.isExternal();
        if (this.isExternal) {
            this.loadTravelDisclosureHistory();
        }
    }

    private listenDataChangeFromStore(): void {
        this.$subscriptions.push(
            this._dataStore.dataEvent.subscribe((dependencies: string[]) => {
                this.getDataFromStore();
            })
        );
    }

    private getTravelHistoryRO(): TravelHistoryRO {
        return {
            'personId': this.travelDisclosure.personId,
            'entityNumber': this.travelDisclosure.personEntity.personEntityNumber
        };
    }

    private loadTravelDisclosureHistory(): void {
        this.isLoading = true;
        this.$subscriptions.push(
            this._service.loadTravelDisclosureHistory(this.getTravelHistoryRO())
                .subscribe((res: Array<TravelHistory>) => {
                    if (res) {
                        this.isLoading = false;
                        this.historyData = res;
                        this.addFirstAndLastStayEndDates();
                    }
                }, (err) => {
                    this.isLoading = false;
                    this._commonService.showToast(HTTP_ERROR_STATUS, 'Error in Loading Travel Disclosure History');
                })
        );
    }

    viewEntity(entityId: string): void {
        this._router.navigate(['/coi/entity-management/entity-details'], { queryParams: { entityManageId: entityId } });
    }

    getFormattedAmount(travelAmount: number): string {
        return getFormattedAmount(travelAmount);
    }

    viewTravelDisclosure(travelDisclosureId: number) {
        openInNewTab('travel-disclosure/summary?', ['disclosureId'], [travelDisclosureId]);
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

      addFirstAndLastStayEndDates(): void {
        this.historyData = this.historyData.map(disclosure => {
            if (disclosure.travelDestinations && disclosure.travelDestinations.length > 0) {
              // Extract all stayStartDate and stayEndDate values
              const DESTINATION_START_DATES = disclosure.travelDestinations
                .filter(destination => destination.stayStartDate)
                .map(destination => destination.stayStartDate);
      
              const DESTINATION_END_DATES = disclosure.travelDestinations
                .filter(destination => destination.stayEndDate)
                .map(destination => destination.stayEndDate);
      
              if (DESTINATION_START_DATES.length > 0) {
                const FIRST_START_DATE = Math.min(...DESTINATION_START_DATES);
                disclosure.firstStayStartDate = new Date(FIRST_START_DATE);
              } else {
                disclosure.firstStayStartDate = null;
              }
      
              if (DESTINATION_END_DATES.length > 0) {
                const LAST_END_DATE = Math.max(...DESTINATION_END_DATES);
                disclosure.lastStayEndDate = new Date(LAST_END_DATE);
              } else {
                disclosure.lastStayEndDate = null;
              }
            } else {
              disclosure.firstStayStartDate = null;
              disclosure.lastStayEndDate = null;
            }
      
            return disclosure;
          });
      }
}
