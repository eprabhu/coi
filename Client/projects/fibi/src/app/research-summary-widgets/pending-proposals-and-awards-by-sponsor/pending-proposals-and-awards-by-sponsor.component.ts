import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonService } from '../../common/services/common.service';
import { Router } from '@angular/router';
import { ResearchSummaryWidgetsService } from '../research-summary-widgets.service';
import { ResearchSummaryConfigService } from '../../common/services/research-summary-config.service';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { getEndPointOptionsForSponsor, getEndPointOptionsForSponsorHierarchy } from '../../common/services/end-point.config';
import { NavigationService } from '../../common/services/navigation.service';
import { DEFAULT_SPONSOR } from '../../app-constants';
import { fadeDown } from '../../common/utilities/animations';

@Component({
    selector: 'app-pending-proposals-and-awards-by-sponsor',
    templateUrl: './pending-proposals-and-awards-by-sponsor.component.html',
    styleUrls: ['./pending-proposals-and-awards-by-sponsor.component.css'],
    animations: [fadeDown]
})
export class PendingProposalsAndAwardsBySponsorComponent implements OnInit, OnDestroy {

    summaryData: any = [];
    isShowLoader = false;
    widgetDescription: any;
    unitNumber = '';
    $subscriptions: Subscription[] = [];
    isSponsor = true;
    sponsorSearchOptions: any = {};
    clearSponsorSearch: String;
    sponsorCodes: any;
    sponsorGroupId: any;
    sponsorName: any;
    selectNameList: any = [];
    sponsorSearchList: any = [];
    sponsorSelectValidation = new Map();
    unitName = '';
    descentFlag = null;

    constructor(public _commonService: CommonService, private _router: Router,
        private _researchSummaryWidgetService: ResearchSummaryWidgetsService,
        private _researchSummaryConfigService: ResearchSummaryConfigService,
        private _navigationService: NavigationService
    ) {
    }

    ngOnInit() {
        this.widgetDescription = this._researchSummaryWidgetService.getWidgetDescription(31);
        this.sponsorSearchOptions = this.isSponsor ? getEndPointOptionsForSponsor() :
            getEndPointOptionsForSponsorHierarchy();
        this.setPreviousValue();
        this.getSelectedUnit();
    }

    getSelectedUnit() {
        this.$subscriptions.push(this._researchSummaryConfigService.selectedUnit$.subscribe(data => {
            if (data) {
                this.unitNumber =  data.unitNumber;
                this.unitName = data.unitName;
                this.descentFlag = data.descentFlag;
            } else {
                this.unitNumber = '';
                this.unitName = '';
            }
            this.getWidgetData();
        }));
    }

    getWidgetData() {
            if (this.isSponsor) {
                this.sponsorSearchList.length > 0  ? this.getResearchSummaryTable(this.sponsorSearchList) :
                this.sponsorSelect(DEFAULT_SPONSOR);
            } else {
                this.sponsorGroupId ? this.getResearchSummaryTable(this.sponsorGroupId) : this.getResearchSummaryTable(null);
            }
    }

    sponsorSelect(event) {
        if (event) {
            this.isSponsor ? this.selectSponsorList(event) : this.selectSponsorGroup(event);
        } else {
            this.summaryData = [];
            this.sponsorGroupId = '';
        }
    }

    selectSponsorList(event: any) {
        this.clearSponsorSearch = new String('true');
        if (this.checkForDuplcationSponsorAvailable(event.sponsorCode)) {
            this.sponsorSelectValidation.set('sponsor', 'sponsor');
            this.sponsorSearchOptions.errorMessage = 'Already selected sponsor.';
        } else {
            this.sponsorSearchList.push(event.sponsorCode);
            this.getResearchSummaryTable(this.sponsorSearchList);
            this.selectNameList.push(event);
            this.sponsorSelectValidation.clear();
        }
    }

    selectSponsorGroup(event) {
        this.sponsorGroupId = '';
        this.sponsorGroupId = event.sponsorGroupId.toString();
        this._researchSummaryWidgetService.selectedSponsorGroupName = event.sponsorGroupName;
        this.getResearchSummaryTable(this.sponsorGroupId);
        this.selectNameList.push(event);
    }

    checkForDuplcationSponsorAvailable(sponsorCode: any) {
        return !!this.sponsorSearchList.find(element => element == sponsorCode);
    }

    getResearchSummaryTable(requestCodes: any) {
        this.isShowLoader = true;
        const REQUEST_DATA: any = {
            unitNumber: this.unitNumber,
            tabName: 'PENDING_PROPOSALS_AND_AWARDS_BY_SPONSORS',
            descentFlag: this.descentFlag
        };
        if (this.isSponsor) {
            REQUEST_DATA['sponsorCodes'] = requestCodes;
        } else {
            REQUEST_DATA['sponsorGroupId'] = requestCodes;
        }
        this.$subscriptions.push(this._researchSummaryWidgetService
            .getResearchSummaryDatasByWidget(REQUEST_DATA)
            .subscribe((data: any) => {
                this.summaryData = data.widgetDatas || [];
                this.isShowLoader = false;
            }, err => {
                this.isShowLoader = false;
            }));
    }

    getDetailedResearchSummary(summaryLabel, moduleName) {
        this._researchSummaryWidgetService.isSponsorSelected = this.isSponsor;
        this._researchSummaryWidgetService.selectedSponsorGroupId = this.sponsorGroupId;
        this._researchSummaryWidgetService.selectedSponsorCodes = this.sponsorSearchList;
        this._researchSummaryWidgetService.selectedSponsorName = this.selectNameList;
        this._router.navigate(['/fibi/expanded-widgets/pending-proposal-sponsor'],
            { queryParams: this.getQueryParams(summaryLabel, moduleName) });
    }

    getQueryParams(summaryLabel, moduleName) {
        const QUERY_PARAMS = {
            summaryIndex: 'PROPOSALSSUBMITTED',
            summaryHeading: summaryLabel,
            sponsorList: [],
            sponsorGroupID: null,
            UN: this.unitNumber,
            DF: this.descentFlag
        };
        if (moduleName === 'Award') {
            QUERY_PARAMS.summaryIndex = 'PENDING_AWARDS_OF_SPONSORS';
        } else {
            QUERY_PARAMS.summaryIndex = 'PENDING_PROPOSALS_OF_SPONSORS';
        }
        if (this.isSponsor) {
            QUERY_PARAMS.sponsorList = this.sponsorSearchList.join(',');
        } else {
            QUERY_PARAMS.sponsorGroupID = this.sponsorGroupId.toString();
        }
        return QUERY_PARAMS;
    }

    setPreviousValue() {
        if (this._navigationService.previousURL.includes('/fibi/expanded-widgets/pending-proposal-sponsor')) {
            this.isSponsor = this._researchSummaryWidgetService.isSponsorSelected;
            this.sponsorGroupId = this._researchSummaryWidgetService.selectedSponsorGroupId;
            this.sponsorSearchList = this._researchSummaryWidgetService.selectedSponsorCodes;
            this.clearSponsorSearch = new String('false');
            this.sponsorSearchOptions = this.isSponsor ? getEndPointOptionsForSponsor() :
                getEndPointOptionsForSponsorHierarchy();
            this.sponsorSearchOptions.defaultValue = !this.isSponsor ? this._researchSummaryWidgetService.selectedSponsorGroupName : '';
            this.selectNameList = this._researchSummaryWidgetService.selectedSponsorName;
        }
    }

    changeSponsorType() {
        this.sponsorSelectValidation.clear();
        this.sponsorSearchOptions = {};
        this.sponsorSearchOptions = this.isSponsor ? getEndPointOptionsForSponsor() :
            getEndPointOptionsForSponsorHierarchy();
        this.sponsorSearchOptions.errorMessage = [];
        if (this.sponsorSearchList.length && this.isSponsor) {
            this.getResearchSummaryTable(this.sponsorSearchList);
        } else if (this.sponsorGroupId && !this.isSponsor) {
            this.clearSponsorSearch = new String('false');
            this.getResearchSummaryTable(this.sponsorGroupId);
            this.sponsorSearchOptions.defaultValue = this._researchSummaryWidgetService.selectedSponsorGroupName;
        } else {
            this.summaryData = [];
        }
    }

    removeSponsor(sponsorIndex, sponsorCode) {
        this.selectNameList.splice(sponsorIndex, 1);
        const index = this.sponsorSearchList.findIndex(element => element == sponsorCode);
        this.sponsorSearchList.splice(index, 1);
        this.getResearchSummaryTable(this.sponsorSearchList);
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

}
