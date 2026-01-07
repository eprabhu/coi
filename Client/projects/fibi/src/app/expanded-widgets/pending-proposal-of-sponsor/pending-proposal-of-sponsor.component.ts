import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ResearchSummaryConfigService } from '../../common/services/research-summary-config.service';
import { CommonService } from '../../common/services/common.service';
import { fileDownloader } from '../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../common/utilities/subscription-handler';
import { ExpandedWidgetsService } from '../expanded-widgets.service';

@Component({
    selector: 'app-pending-proposal-of-sponsor',
    templateUrl: './pending-proposal-of-sponsor.component.html',
    styleUrls: ['./pending-proposal-of-sponsor.component.css']
})
export class PendingProposalOfSponsorComponent implements OnInit, OnDestroy {

    researchSummaryIndex = null;
    researchSummaryHeading = null;
    serviceRequestResult: any = [];
    $subscriptions: Subscription[] = [];
    unitNumber: String;
    sponsorList: any;
    sponsorGroupId: any;
    column: number;
    direction: number = -1;
    isDesc: boolean;
    descentFlag = null;

    constructor(private _route: ActivatedRoute, public _commonService: CommonService,
        private _expandedWidgetsService: ExpandedWidgetsService,
        private _router: Router
    ) { }

    ngOnInit() {
        this.researchSummaryIndex = this._route.snapshot.queryParamMap.get('summaryIndex');
        this.researchSummaryHeading = this._route.snapshot.queryParamMap.get('summaryHeading');
        this.unitNumber =  this._route.snapshot.queryParamMap.get('UN');
        this.descentFlag = this._route.snapshot.queryParamMap.get('DF');
        this._route.queryParamMap.subscribe(params => this.sponsorList = params.getAll('sponsorList'));
        this._route.queryParamMap.subscribe(params => this.sponsorGroupId = params.getAll('sponsorGroupID'));
        this.loadDetailedResearchSummary();
    }

    loadDetailedResearchSummary() {
        this.$subscriptions.push(this._expandedWidgetsService.getDetailedViewOfWidget({
            tabName: this.researchSummaryIndex,
            unitNumber: this.unitNumber,
            sponsorCodes: this.sponsorList,
            sponsorGroupId: this.sponsorGroupId.toString(),
            descentFlag: this.descentFlag
        }).subscribe((data: any) => {
            this.serviceRequestResult = data.widgetDatas || [];
        }));
    }

    setCurrentProposalTab(proposalDetails) {
        localStorage.setItem('currentTab', 'PROPOSAL_REVIEW');
        if (this.researchSummaryIndex === 'PENDING_AWARDS_OF_SPONSORS') {
            this._router.navigate(['/fibi/award'], { queryParams: { awardId: proposalDetails[0] } });
        } else {
            this._router.navigate(['/fibi/instituteproposal/overview'], { queryParams: { instituteProposalId : proposalDetails[0] } });
        }
    }

    exportAsTypeDoc(docType) {
        const REQUEST_DATA = {
            sponsorCodes: this.sponsorList,
            sponsorGroupId: this.sponsorGroupId.toString(),
            researchSummaryIndex: this.researchSummaryIndex,
            documentHeading: this.researchSummaryHeading,
            exportType: docType === 'excel' ? 'xlsx' : docType === 'pdf' ? 'pdf' : '',
            unitNumber: this.unitNumber,
            descentFlag: this.descentFlag
        };
        this.$subscriptions.push(this._expandedWidgetsService.exportResearchSummaryData(REQUEST_DATA).subscribe(
            data => {
                fileDownloader(data.body, this.researchSummaryHeading.toLowerCase(), REQUEST_DATA.exportType);
            }));
    }

    ngOnDestroy() {
        subscriptionHandler(this.$subscriptions);
    }

    sortBy(property) {
        this.column = property;
        this.direction = this.isDesc ? 1 : -1;
    }

}
