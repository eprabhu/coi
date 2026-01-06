import { ProposalService } from './../../services/proposal.service';
import { ProposalSection } from './../../../proposal/proposal-comparison/comparison-constants';
import { Component, OnInit, OnDestroy, } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToolKitService } from './tool-kit.service';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { History, Section, CompareDetails } from '../interfaces';
import { scrollIntoView } from '../../../common/utilities/custom-utilities';
import { ToolkitEventInteractionService } from '../toolkit-event-interaction.service';
import { slideHorizontal } from '../../../common/utilities/animations';
import { ActivatedRoute } from '@angular/router';
import { HTTP_ERROR_STATUS, ETHICS_SAFETY_LABEL, AREA_OF_RESEARCH } from '../../../app-constants';
import { CommonService } from '../../../common/services/common.service';

@Component({
    selector: 'app-tool-kit',
    templateUrl: './tool-kit.component.html',
    styleUrls: ['./tool-kit.component.css'],
    animations: [slideHorizontal]
})
export class ToolKitComponent implements OnDestroy, OnInit {
    isCurrentReviewTab = 'SECTION';
    $subscriptions: Subscription[] = [];
    proposalVersionsData: Array<History> = [];
    sections: Array<Section> = ProposalSection;
    scrollIntoView = scrollIntoView;
    leftVersion: History;
    rightVersion: History;
    isToolkitVisible = true;
    isCompareFlag = false;
    deBounceTimer: any;
    masterVersion: History;
    isMasterCompare = false;
    parameterValue: any;
    isShowMiniToolkit = false;
    constructor(private _toolKitService: ToolKitService,
        public _toolKitEvents: ToolkitEventInteractionService, private route: ActivatedRoute,
        public _commonService: CommonService, public _proposalService: ProposalService) { }
    ngOnInit() {
        this.$subscriptions.push(this._toolKitService.getProposalHistoryInfo(this.route.snapshot.queryParamMap.get('proposalId'))
            .subscribe((result: any) => {
                this.parameterValue = result.parameterValue;
                this.filterSections();
                this.proposalVersionsData = this.formatProposalHistory(result.proposalHistory, result.proposalStatus);
                this.masterVersion = this.setActiveVersion(result.proposalStatus);
                this.viewProposal(this.masterVersion);
            }));
        this.getCompareValue();
        this.getCompareFromHeader();
        this.isToolkitVisible = this._commonService.isDevProposalVersioningEnabled ? true : false;
        this._toolKitEvents.$isToolkitVisible.next(this.isToolkitVisible);
        this.getToolkitVisibility();
    }

    ngOnDestroy() {
        this._toolKitEvents.proposalSequenceStatus.next('');
        subscriptionHandler(this.$subscriptions);
    }

    setActiveVersion(proposalStatus: number): History {
        const proposalId: any = this.route.snapshot.queryParamMap.get('proposalId');
        return {
            activeProposalId: proposalId,
            proposalId: proposalId,
            requestType: 'Active Proposal',
            createUserFullName: '',
            createTimestamp: '',
            versionNumber: 0,
            activeProposalStatus: proposalStatus
        };
    }

    filterSections() {
        this.sections = this.sections.filter((eachSection) => !this.checkParameterValue().includes(eachSection.reviewSectionCode));
        if (this._commonService.isEnableSpecialReview) {
            const specialReviewSection = this.sections.find((eachSection) => eachSection.reviewSectionCode === 303);
            specialReviewSection.reviewSectionDescription = ETHICS_SAFETY_LABEL;
        }
        const areaOfResearchSection = this.sections.find((eachSection) => eachSection.reviewSectionCode === 304);
        areaOfResearchSection.reviewSectionDescription = AREA_OF_RESEARCH;
    }

    checkParameterValue() {
        const SECTION_ARRAY = [];
        // tslint:disable:no-unused-expression
        !this._commonService.isEnableSpecialReview ? SECTION_ARRAY.push(303) : '';
        !this._commonService.isProposalOrganizationEnabled ? SECTION_ARRAY.push(332) : '';
        !this.parameterValue.isPeriodTotalEnabled ? SECTION_ARRAY.push(308) : '';
        !this.parameterValue.isDetailedBudgetEnabled ? SECTION_ARRAY.push(310) : '';
        !this.parameterValue.isSimpleBudgetEnabled ? SECTION_ARRAY.push(311) : '';
        !this.parameterValue.isModularBudgetEnabled ? SECTION_ARRAY.push(338) : '';
        !this.parameterValue.isBudgetSummaryEnabled ? SECTION_ARRAY.push(307) : '';
        return SECTION_ARRAY;
    }

    scrollToSection(id: string) {
        scrollIntoView(id);
    }

    getCurrentVersion() {
        const proposalId: any = this.route.snapshot.queryParamMap.get('proposalId');
        return this.getProposalIndex(proposalId);
    }

    getProposalIndex(proposalId) {
        return this.proposalVersionsData.findIndex(a => a.proposalId === proposalId);
    }

    getToolkitVisibility() {
        this.$subscriptions.push(this._toolKitEvents.$isToolkitVisible.subscribe(data => {
            (this.isToolkitVisible = data) ? this.collapseToolKit() : this.expandToolKit();
        }));
    }

    formatProposalHistory(data: Array<any>, propsalStatus: number): Array<History> {
        const historyList: Array<History> = [];
        data.map((d, index) => {
            const history: any = {};
            history.activeProposalId = d.activeProposalId;
            history.proposalId = d.archiveProposalId;
            history.requestType = d.requestType;
            history.createUserFullName = d.createUserFullName;
            history.createTimestamp = d.createTimestamp;
            history.versionNumber = data.length - index;
            history.activeProposalStatus = propsalStatus;
            historyList.push(history);
        });
        return historyList;
    }

    switchVersions() {
        if (this.rightVersion && this.leftVersion) {
            const tempVersion = this.rightVersion;
            this.rightVersion = this.leftVersion;
            this.leftVersion = tempVersion;
        }
    }

    viewProposal(version) {
        this.leftVersion = version;
        this.rightVersion = null;
        this.setHeader(version, null);
        const ViewData: CompareDetails = {
            baseProposalId: version.proposalId.toString(),
            currentProposalId: '',
            activeProposalId: version.activeProposalId,
            activeProposalStatus: version.activeProposalStatus
        };
        this._toolKitEvents.$viewEvent.next(ViewData);
        this._toolKitEvents.$isCompareActive.next(false);
        this._toolKitEvents.proposalSequenceStatus.next(version.proposalSequenceStatus);
        // this.getFilterCommentReviewersList(ViewData.baseProposalId);
    }

    compareProposalVersions() {
        this.setHeader(this.leftVersion, this.rightVersion);
        const CompareData: CompareDetails = {
            baseProposalId: this.leftVersion.proposalId.toString(),
            currentProposalId: this.rightVersion.proposalId.toString(),
            activeProposalId: this.leftVersion.activeProposalId.toString(),
            activeProposalStatus: this.leftVersion.activeProposalStatus
        };
        this._toolKitEvents.$compareEvent.next(CompareData);
    }

    setHeader(leftVersion = null, rightVersion = null) {
        const CompareVersions = {
            leftVersion: leftVersion || this.leftVersion,
            rightVersion: rightVersion || {},
        };
        this._toolKitEvents.$currentHeader.next(CompareVersions);
    }

    updateToolkitView() {
        this.isToolkitVisible = !this.isToolkitVisible;
        this._toolKitEvents.$isToolkitVisible.next(this.isToolkitVisible);
    }

    expandToolKit() {
        (document.getElementById('proposal_tab_content') as HTMLElement).style.width = '100%';
    }

    collapseToolKit() {
        (document.getElementById('proposal_tab_content') as HTMLElement).style.width = '75%';
    }

    getCurrentHeader() {
        this.$subscriptions.push(this._toolKitEvents.$currentHeader.subscribe(data => this.setHeaderValues(data)));
    }

    getCompareValue() {
        this.$subscriptions.push(this._toolKitEvents.$isCompareActive.subscribe(data =>
            this.isCompareFlag = data));
    }

    getCompareFromHeader() {
        this.$subscriptions.push(this._toolKitEvents.$compareFromHeader.subscribe(data => {
            if (data) {
                this.checkForComparisonVersion(data);
            } else {
                this.viewProposal(this.rightVersion);
            }
        }));
    }

    checkForComparisonVersion(data) {
        if (this.leftVersion) {
            this.rightVersion = this.leftVersion;
            this.leftVersion = this.setActiveVersion(this.leftVersion.activeProposalStatus);
            this.compareProposalVersions();
        } else {
            this._commonService.showToast(HTTP_ERROR_STATUS, 'No previous version available to compare.');
            this._toolKitEvents.$isCompareActive.next(false);
        }
    }

    setHeaderValues(data: any) {
        this.leftVersion = data.leftVersion;
        this.rightVersion = data.rightVersion || {};
    }

}
