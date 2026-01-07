import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { closeCoiSlider, openCoiSlider } from '../../common/utilities/custom-utilities';
import { DISCLOSURE_TYPE, HTTP_ERROR_STATUS } from '../../app-constants';
import { CommonService } from '../../common/services/common.service';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { CompleteDisclosureHistoryService } from './complete-dislcosure-history.service';
import { HistorySliderFilterTypes, UserDisclosureDetails } from '../../common/services/coi-common.interface';
import { DISCLOSURE_HISTORY_NO_INFO_MESSAGE } from '../../no-info-message-constants';
import { DeclarationAdminDashboard } from '../../declarations/declaration.interface';
import { COMMON_DISCL_LOCALIZE, DECLARATION_LOCALIZE } from '../../app-locales';

@Component({
    selector: 'app-complete-disclosures-history-slider',
    templateUrl: './complete-disclosures-history-slider.component.html',
    styleUrls: ['./complete-disclosures-history-slider.component.scss'],
    providers: [ CompleteDisclosureHistoryService ]
})
export class CompleteDisclosuresHistorySliderComponent implements OnInit {

    @Input() disclosureDetails;
    @Output() closePage: EventEmitter<any> = new EventEmitter<any>();

    $subscriptions: Subscription[] = [];
    historyData: any = []
    entireDisclosureHistorySliderId = 'disclosure-complete-history-slider';
    isOpenSlider = false;
    isShowFilterAndSearch = false
    currentFilter: HistorySliderFilterTypes = 'ALL';
    completeDisclosureList: UserDisclosureDetails[] = [];
    noDataMessage = DISCLOSURE_HISTORY_NO_INFO_MESSAGE;
    declarationLocalize = DECLARATION_LOCALIZE;
    isLoading = true;
    COMMON_DISCL_LOCALIZE = COMMON_DISCL_LOCALIZE;

    constructor(private _completeDisclosureHistoryService: CompleteDisclosureHistoryService, public commonService: CommonService) { }

    ngOnInit(): void {
        this.getDisclosureHistory();
    }

    ngOnDestroy(): void {
        subscriptionHandler(this.$subscriptions);
    }

    private getDisclosureHistory(): void {
        this.isLoading = true;
        this.completeDisclosureList = [];
        const DISCLOSURE_HISTORY_RO = {
          'filterType': this.currentFilter,
          'documentOwner' :  this.disclosureDetails.personId 
        }
        this.$subscriptions.push(this._completeDisclosureHistoryService.getDisclosureHistory(DISCLOSURE_HISTORY_RO).subscribe((data: any) => {
            this.viewSlider();
            this.isLoading = false;
            this.completeDisclosureList = this.getAllDisclosureHistories(data);
        }, error => {
            this.isLoading = false;
            this.commonService.showToast(HTTP_ERROR_STATUS, 'Error in fetching disclosure history. Please try again.');
            if (!this.isOpenSlider) {
                this.closeHistorySlider();
            }
        }));
    }

    private viewSlider(): void {
        if (!this.isOpenSlider) {
            this.isOpenSlider = true;
            this.isShowFilterAndSearch = true;
            setTimeout(() => {
                openCoiSlider(this.entireDisclosureHistorySliderId);
            });
        }
    }

    closeHistorySlider(): void {
        closeCoiSlider(this.entireDisclosureHistorySliderId);
        setTimeout(() => {
            this.isOpenSlider = false;
            this.isShowFilterAndSearch = false;
            this.closePage.emit();
        }, 500);
    }

    setFilter(type): void {
        this.currentFilter = type;
        this.resetAndFetchDisclosure();
    }

    private resetAndFetchDisclosure(): void {
        this.completeDisclosureList = [];
        this.getDisclosureHistory();
    } 

    private getAllDisclosureHistories(data: { opaDashboardDtos: any[], disclosureHistoryDtos: any[], declDashboardResponses: DeclarationAdminDashboard[] }): any {
        const DISCLOSURE_HISTORY = this.getDisclosureHistoryProjectHeader(data?.disclosureHistoryDtos);
        const OPA_HISTORY = data?.opaDashboardDtos || [];
        const DECLARATION_HISTORY = data?.declDashboardResponses || [];
        const MERGED_LIST = [...DISCLOSURE_HISTORY, ...OPA_HISTORY, ...DECLARATION_HISTORY];
        return this.getSortedListForParam(MERGED_LIST, 'updateTimeStamp');
    }

    private getDisclosureHistoryProjectHeader(disclosureHistory: any): any[] {
        return disclosureHistory?.map((ele: any) => {
            ele.projectHeader = ele.fcoiTypeCode == DISCLOSURE_TYPE.PROJECT ? `#${ele.projectNumber} - ${ele.projectTitle}` : '';
            return ele;
        }) || [];
    }

    /**
     * Description
     * @param {any} arrayList:any
     * @param {any} sortByParam:any
     * @returns {any}
     * The method takes an input array and returns the corresponding sorted array for the param passed
     */
    private getSortedListForParam(arrayList: any, sortByParam: any): any {
        return arrayList.sort((a, b) => b[sortByParam] - a[sortByParam]);
    }

    closeSlider(): void {
        this.closeHistorySlider();
    }
}
