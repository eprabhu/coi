import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { HTTP_ERROR_STATUS, ETHICS_SAFETY_LABEL, AREA_OF_RESEARCH } from '../../../app-constants';
import { CommonService } from '../../../common/services/common.service';
import { slideHorizontal } from '../../../common/utilities/animations';
import { scrollIntoView } from '../../../common/utilities/custom-utilities';
import { subscriptionHandler } from '../../../common/utilities/subscription-handler';
import { DataStoreService } from '../../services/data-store.service';
import { InstituteProposalService } from '../../services/institute-proposal.service';
import { IPSection } from '../comparison-constants';
import { CompareDetails, IPHistory, Section } from '../interface';
import { ToolkitInteractionService } from '../toolkit-interaction.service';
import { ToolKitService } from './tool-kit.service';

@Component({
	selector: 'app-tool-kit',
	templateUrl: './tool-kit.component.html',
	styleUrls: ['./tool-kit.component.css'],
	animations: [slideHorizontal]
})
export class ToolKitComponent implements OnInit, OnDestroy {

	isCurrentReviewTab = 'SECTION';
	$subscriptions: Subscription[] = [];
	proposalVersionsData: Array<IPHistory> = [];
	sections: Array<Section> = IPSection;
	scrollIntoView = scrollIntoView;
	leftVersion: IPHistory;
	rightVersion: IPHistory;
	isToolkitVisible = true;
	isCompareFlag = false;
	deBounceTimer: any;
	masterVersion: IPHistory;
	isMasterCompare = false;
	parameterValue: any;
	isShowMiniToolkit = false;
	ipHistories: any;
	proposalNumber: '';

	constructor(
		private _toolKitService: ToolKitService,
        private _toolKitEvents: ToolkitInteractionService,
        public commonService: CommonService,
		public proposalService: InstituteProposalService,
		private _instituteProposalStore: DataStoreService
	) { }

	ngOnInit() {
		this.getIPDetails();
		this.getCompareValue();
		this.getCompareFromHeader();
		this.isToolkitVisible = this.commonService.isDevProposalVersioningEnabled ? true : false;
		this._toolKitEvents.$isToolkitVisible.next(this.isToolkitVisible);
		this.getToolkitVisibility();
	}

	private getIPDetails(): void {
		const IP = this._instituteProposalStore.getData(['instProposal']);
		this.$subscriptions.push(this._toolKitService.getIPHistory(IP.instProposal.proposalNumber)
			.subscribe((result: any) => {
				this.parameterValue = result.parameterValue;
				this.renameSectionDescription();
				this.ipHistories = result.instituteProposalHistories;
				this.proposalVersionsData = this.formatProposalHistory(result.instituteProposalHistories);
				this.masterVersion = this.setActiveVersion(result.instituteProposalHistories);
				this.viewProposal(this.masterVersion);
			}));
	}

	renameSectionDescription(): void {
		const specialReviewSection = this.sections.find((eachSection) => eachSection.reviewSectionCode === 204);
        specialReviewSection.reviewSectionDescription = ETHICS_SAFETY_LABEL;
        const areaOfResearchSection = this.sections.find((eachSection) => eachSection.reviewSectionCode === 205);
        areaOfResearchSection.reviewSectionDescription = AREA_OF_RESEARCH;
	}

	private getCompareValue(): any {
		this.$subscriptions.push(
			this._toolKitEvents.$isCompareActive.subscribe(data =>
			this.isCompareFlag = data
		));
	}

	private getCompareFromHeader(): void {
		this.$subscriptions.push(this._toolKitEvents.$compareFromHeader.subscribe(data => {
			if (data) {
				this.checkForComparisonVersion();
			} else {
				this.viewProposal(this.rightVersion);
			}
		}));
	}

	private setActiveVersion(data): IPHistory {
		const ip: any = data.find(ele => ele.proposalSequenceStatus === 'ACTIVE');
		return {
			activeProposalId: ip.proposalId,
			proposalId: ip.proposalId,
			requestType: 'Active Institute Proposal',
			createUserFullName: '',
			createTimestamp: '',
			versionNumber: ip.sequenceNumber,
			proposalNumber: ip.proposalNumber,
			proposalSequenceStatus: ip.proposalSequenceStatus,
			description: ''
		};
	}

	scrollToSection(id: string): void {
		scrollIntoView(id);
	}

	private getToolkitVisibility(): void {
		this.$subscriptions.push(this._toolKitEvents.$isToolkitVisible.subscribe(data => {
			(this.isToolkitVisible = data) ? this.collapseToolKit() : this.expandToolKit();
		}));
	}

	private formatProposalHistory(data: any): Array<IPHistory> {
		const historyList: Array<IPHistory> = [];
		data.map((d, index) => {
			const history: any = {};
		    d.proposalSequenceStatus === 'ACTIVE' ? history.activeProposalId = d.proposalId : history.proposalId  = d.proposalId ;
			history.requestType = d.requestType === '' ? 'Institute Proposal Modification' : d.requestType;
			history.createUserFullName = d.createUserFullName;
			history.createTimestamp = d.createTimestamp;
			history.versionNumber = d.sequenceNumber;
			history.proposalNumber = d.proposalNumber;
			history.proposalSequenceStatus = d.proposalSequenceStatus;
			history.description = d.description;
			historyList.push(history);
		});
		return historyList;
	}

	viewProposal(version): void {
		this.leftVersion = version;
		this.rightVersion = null;
		this.setHeader(version, null);
		const ViewData: CompareDetails = {
			baseProposalId: version.proposalId.toString(),
			currentProposalId: '',
			proposalNumber: version.proposalNumber,
			baseVersionNumber: version.versionNumber,
			currentVersionNumber: null
		};
		this._toolKitEvents.$viewEvent.next(ViewData);
		this._toolKitEvents.$isCompareActive.next(false);
	}

	private compareProposalVersions(): void {
		this.setHeader(this.leftVersion, this.rightVersion);
		const CompareData: CompareDetails = {
			baseProposalId: this.leftVersion.proposalId.toString(),
			currentProposalId: this.rightVersion.proposalId.toString(),
			proposalNumber: this.rightVersion.proposalNumber,
			baseVersionNumber: this.leftVersion.versionNumber,
			currentVersionNumber: this.rightVersion.versionNumber
		};
		this._toolKitEvents.$compareEvent.next(CompareData);
	}

	private setHeader(leftVersion = null, rightVersion = null): void {
		const CompareVersions = {
			leftVersion: leftVersion || this.leftVersion,
			rightVersion: rightVersion || {},
		};
		this._toolKitEvents.$currentHeader.next(CompareVersions);
	}

	updateToolkitView(): void {
		this.isToolkitVisible = !this.isToolkitVisible;
		this._toolKitEvents.$isToolkitVisible.next(this.isToolkitVisible);
	}

	expandToolKit(): void {
		(document.getElementById('ip_compare_review') as HTMLElement).style.width = '100%';
	}

	collapseToolKit(): void {
		(document.getElementById('ip_compare_review') as HTMLElement).style.width = '75%';
	}

	private checkForComparisonVersion(): void {
		if (this.leftVersion) {
			this.rightVersion = this.leftVersion;
			this.leftVersion = this.setActiveVersion(this.ipHistories);
			this.compareProposalVersions();
		} else {
			this.commonService.showToast(HTTP_ERROR_STATUS, 'No previous version available to compare.');
			this._toolKitEvents.$isCompareActive.next(false);
		}
	}

	ngOnDestroy() {
		subscriptionHandler(this.$subscriptions);
	}


}
