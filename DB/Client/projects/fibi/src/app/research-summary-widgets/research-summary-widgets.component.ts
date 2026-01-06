import { ProposalListByFundingSchemeComponent } from './proposal-list-by-funding-scheme/proposal-list-by-funding-scheme.component';
import { ProposalListByGrantcallComponent } from './proposal-list-by-grantcall/proposal-list-by-grantcall.component';
import { ProposalListBySponsorComponent } from './proposal-list-by-sponsor/proposal-list-by-sponsor.component';
import { ProposalSubmittedByLeadunitComponent } from './proposal-submitted-by-leadunit/proposal-submitted-by-leadunit.component';
/**
 * widget componemts are listed in the object 'widgetComponent'
 * the key is the widget id.
 */
import { Component, OnDestroy, OnInit } from '@angular/core';

import { ActionListComponent } from './action-list/action-list.component';
import { ExpenditureVolumeChartComponent } from './expenditure-volume-chart/expenditure-volume-chart.component';
import { ResearchSummaryDetailsComponent } from './research-summary-details/research-summary-details.component';
import { FibiSupportComponent } from './fibi-support/fibi-support.component';
import { AwardBySponsorTypesPiechartComponent } from './award-by-sponsor-types-piechart/award-by-sponsor-types-piechart.component';
import { InprogressProposalsDonutChartComponent } from './inprogress-proposals-donut-chart/inprogress-proposals-donut-chart.component';
import { ProposalBySponsorPieChartComponent } from './proposal-by-sponsor-pie-chart/proposal-by-sponsor-pie-chart.component';
import { CommonService } from '../common/services/common.service';
// tslint:disable-next-line: max-line-length
import { AwardedProposalBySponsorDonutChartComponent } from './awarded-proposal-by-sponsor-donut-chart/awarded-proposal-by-sponsor-donut-chart.component';
import { Subscription } from 'rxjs';
import { subscriptionHandler } from '../common/utilities/subscription-handler';
import { ResearchSummaryWidgetsService } from './research-summary-widgets.service';
import { ResearchSummaryConfigService } from '../common/services/research-summary-config.service';
import { QuickLinksComponent } from './quick-links/quick-links.component';
import { ClaimsSubmittedToSponsorByFYComponent } from './claims-submitted-to-sponsor-by-FY/claims-submitted-to-sponsor-by-FY.component';
import { RecentAwardsComponent } from './recent-awards/recent-awards.component';
import { UnderUtilizedAwardsComponent } from './under-utilized-awards/under-utilized-awards.component';
import { AwardBudgetExpenseComponent } from './award-budget-expense/award-budget-expense.component';
import { AwardBySponsorPieChartComponent } from './award-by-sponsor-pie-chart/award-by-sponsor-pie-chart.component';
import { ResearchFundingBarChartComponent } from './research-funding-bar-chart/research-funding-bar-chart.component';
import { AwardsByDepartmentLayerTableComponent } from './awards-by-department-layer-table/awards-by-department-layer-table.component';
import { SubmissionBasedClaimAgingComponent } from './submission-based-claim-aging/submission-based-claim-aging.component';
// tslint:disable-next-line: max-line-length
import { ClaimsSubmittedToSponsorByClaimStatusComponent } from './claims-submitted-to-sponsor-by-claim-status/claims-submitted-to-sponsor-by-claim-status.component';
import { AwardExpenditureByFinancialYearComponent } from './award-expenditure-by-financial-year/award-expenditure-by-financial-year.component';
// tslint:disable-next-line: max-line-length
import { ExpenditureByBudgetCategoryInMonthsComponent } from './expenditure-by-budget-category-in-months/expenditure-by-budget-category-in-months.component';
import { ExternalAwardByDepartmentComponent } from './external-award-by-department/external-award-by-department.component';
import { InternalAwardListComponent } from './internal-award-list/internal-award-list.component';
import { ProjectEndedButNotClosedComponent } from './project-ended-but-not-closed/project-ended-but-not-closed.component';
import { AttentionRequiredListComponent } from './attention-required-list/attention-required-list.component';
import { SummaryComponent } from './summary/summary.component';
import { PendingProposalBySponsorTypeComponent } from './pending-proposal-by-sponsor-type/pending-proposal-by-sponsor-type.component';
import { AwardBySponsorTypesComponent } from './award-by-sponsor-types/award-by-sponsor-types.component';
// tslint:disable-next-line: max-line-length
import { PendingProposalsAndAwardsBySponsorComponent } from './pending-proposals-and-awards-by-sponsor/pending-proposals-and-awards-by-sponsor.component';
import { ResearchSummaryCountComponent } from './research-summary-count/research-summary-count.component';
import { ResearchSummaryDailyCheckComponent } from './research-summary-daily-check/research-summary-daily-check.component';
import { CompleterOptions } from '../service-request/service-request.interface';
import { getCompleterOptionsForCategory } from '../common/services/completer.config';
import { InstituteProposalSubmittedByLeadUnitComponent } from './institute-proposal-submitted-by-Lead-unit/institute-proposal-submitted-by-Lead-unit.component';
import { InstituteProposalBySponsorComponent } from './institute-proposal-by-sponsor/institute-proposal-by-sponsor.component';
import { PendingIpsBySponsorTypeComponent } from './pending-ips-by-sponsor-type/pending-ips-by-sponsor-type.component';

@Component({
	selector: 'app-research-summary-widgets',
	templateUrl: './research-summary-widgets.component.html',
	styleUrls: ['./research-summary-widgets.component.css']
})
export class ResearchSummaryWidgetsComponent implements OnInit, OnDestroy {

	savedWidgetList: any = [];
	unitAdministrators: any = [];
	categoryCompleterOptions: CompleterOptions = new CompleterOptions();
	widgetList: any = [];
	$subscriptions: Subscription[] = [];
	researchSummaryConfig: any;
	isDescentFlagOn = true;
	private readonly _moduleCode = 'RS52';
	unitObject: any;
	widgetComponents: any = {
		1: ResearchSummaryDetailsComponent,
		2: ActionListComponent,
		3: ExpenditureVolumeChartComponent,
		4: FibiSupportComponent,
		5: AwardedProposalBySponsorDonutChartComponent,
		6: AwardBySponsorTypesPiechartComponent,
		7: InprogressProposalsDonutChartComponent,
		8: ProposalBySponsorPieChartComponent,
		9: QuickLinksComponent,
		10: AwardBudgetExpenseComponent,
		11: RecentAwardsComponent,
		13: AwardBySponsorPieChartComponent,
		12: UnderUtilizedAwardsComponent,
		14: ClaimsSubmittedToSponsorByFYComponent,
		15: ResearchFundingBarChartComponent,
		16: ClaimsSubmittedToSponsorByClaimStatusComponent,
		17: AwardsByDepartmentLayerTableComponent,
		18: SubmissionBasedClaimAgingComponent,
		19: AwardExpenditureByFinancialYearComponent,
		20: ExpenditureByBudgetCategoryInMonthsComponent,
		21: InternalAwardListComponent,
		22: ExternalAwardByDepartmentComponent,
		23: ProjectEndedButNotClosedComponent,
		24: AttentionRequiredListComponent,
		25: ProposalSubmittedByLeadunitComponent,
		26: ProposalListBySponsorComponent,
		27: ProposalListByFundingSchemeComponent,
		28: ProposalListByGrantcallComponent,
		29: AwardBySponsorTypesComponent,
		30: PendingProposalBySponsorTypeComponent,
		1301: SummaryComponent,
		31: PendingProposalsAndAwardsBySponsorComponent,
		32: ResearchSummaryCountComponent,
		33: ResearchSummaryDailyCheckComponent,
		34: InstituteProposalSubmittedByLeadUnitComponent,
		35: InstituteProposalBySponsorComponent,
		36: PendingIpsBySponsorTypeComponent

	};

	constructor(private _commonService: CommonService,
		public _researchSummaryConfigService: ResearchSummaryConfigService,
		public _researchSummaryWidgetService: ResearchSummaryWidgetsService) { }

	ngOnInit() {
		this._researchSummaryConfigService.isResearchSummary = true;
		this.getUnitWithRights();
		this.getResearchSummaryConfig();
	}

	private getWidgetLookups() {
		this.$subscriptions.push(this._researchSummaryWidgetService.getWidgetLookups()
			.subscribe((data: any) => {
				this._researchSummaryWidgetService.widgetLookUpList = data.widgetLookups;
				this.savedWidgetList = data.userSelectedWidgets;
				this.sortWidgetList();
				this.prepareSavedWidgetList();
				this._commonService.isPreventDefaultLoader = true;
			}));
	}

	private getUnitWithRights() {
		this.$subscriptions.push(this._researchSummaryWidgetService.getUnitWithRights(this._commonService.getCurrentUserDetail('personID'))
			.subscribe(data => {
				this.unitAdministrators = data;
				let previousUnit: any = sessionStorage.getItem('SUMMARY_OBJECT') || null;
				previousUnit = JSON.parse(previousUnit);
				this.categoryCompleterOptions = getCompleterOptionsForCategory(this.unitAdministrators);
				this.getRootUnit(previousUnit);
				this.getWidgetLookups();
			}));
	}

	private getRootUnit(unit) {
		if (!unit) {
			unit = this.unitAdministrators.find(ele => ele.parentUnitNumber == null);
		}
		this.categoryCompleterOptions.defaultValue = unit && unit.unitDetail;
		this.updateUnitChange(unit);
	}

	public updateUnitChange(event) {
		if (event) {
			this.unitObject = event;
			this.isDescentFlagOn = event.descentFlag ? event.descentFlag  === 'Y' ? true : false : true;
		} else {
			this.unitObject = null;
			this.isDescentFlagOn = false;
			sessionStorage.removeItem('SUMMARY_OBJECT');
		}
		this.updateWidgets();
	}

	public prepareSavedWidgetList(savedWidgetList = this.savedWidgetList) {
		this.widgetList = JSON.parse(JSON.stringify(savedWidgetList));
		this.widgetList.forEach((widget) => {
			widget.component = this.widgetComponents[widget.widgetId];
		});
	}

	private sortWidgetList() {
		this.savedWidgetList.sort((a, b) => {
			return a.sortOrder - b.sortOrder;
		});
	}

	ngOnDestroy() {
		this._commonService.isPreventDefaultLoader = false;
		this._researchSummaryWidgetService.widgetLookUpList = [];
		subscriptionHandler(this.$subscriptions);
		this._researchSummaryConfigService.isResearchSummary = false;
	}

	public updateWidgets() {
		const request = {...this.unitObject, ...{'descentFlag': this.isDescentFlagOn ? 'Y' : 'N'}};
		if (this.unitObject) {
			sessionStorage.setItem('SUMMARY_OBJECT', JSON.stringify(request));
		}
		this._researchSummaryConfigService.selectedUnit$.next(request);
	}

	private getResearchSummaryConfig() {
		this.$subscriptions.push(this._commonService.getDashboardActiveModules(this._moduleCode).subscribe(data => {
			this.researchSummaryConfig = this._commonService.getSectionCodeAsKeys(data);
		}));
	}

}
