import { ProposalListByGrantcallComponent } from './proposal-list-by-grantcall/proposal-list-by-grantcall.component';
import { ProposalSubmittedByLeadunitComponent } from './proposal-submitted-by-leadunit/proposal-submitted-by-leadunit.component';
import { ProposalListBySponsorComponent } from './proposal-list-by-sponsor/proposal-list-by-sponsor.component';
import { ProposalListByFundingSchemeComponent } from './proposal-list-by-funding-scheme/proposal-list-by-funding-scheme.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResearchSummaryWidgetsComponent } from './research-summary-widgets.component';
import { ResearchSummaryWidgetsRoutingModule } from './research-summary-widgets-routing.module';
import { ResearchSummaryWidgetsService } from './research-summary-widgets.service';
import { ResearchSummaryDetailsComponent } from './research-summary-details/research-summary-details.component';
import { ActionListComponent } from './action-list/action-list.component';
import { SharedModule } from '../shared/shared.module';
import { ExpenditureVolumeChartComponent } from './expenditure-volume-chart/expenditure-volume-chart.component';
import { GoogleChartService } from './google-chart.service';
import { FibiSupportComponent } from './fibi-support/fibi-support.component';
import { AwardBySponsorTypesPiechartComponent } from './award-by-sponsor-types-piechart/award-by-sponsor-types-piechart.component';
import { InprogressProposalsDonutChartComponent } from './inprogress-proposals-donut-chart/inprogress-proposals-donut-chart.component';
import { ProposalBySponsorPieChartComponent } from './proposal-by-sponsor-pie-chart/proposal-by-sponsor-pie-chart.component';
import { ConfigureWidgetsComponent } from './configure-widgets/configure-widgets.component';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AwardedProposalBySponsorDonutChartComponent } from './awarded-proposal-by-sponsor-donut-chart/awarded-proposal-by-sponsor-donut-chart.component';
import { QuickLinksComponent } from './quick-links/quick-links.component';
import { AwardsByDepartmentLayerTableComponent } from './awards-by-department-layer-table/awards-by-department-layer-table.component';
import { ClaimsSubmittedToSponsorByFYComponent } from './claims-submitted-to-sponsor-by-FY/claims-submitted-to-sponsor-by-FY.component';
import { RecentAwardsComponent } from './recent-awards/recent-awards.component';
import { UnderUtilizedAwardsComponent } from './under-utilized-awards/under-utilized-awards.component';
import { AwardBudgetExpenseComponent } from './award-budget-expense/award-budget-expense.component';
import { AwardBySponsorPieChartComponent } from './award-by-sponsor-pie-chart/award-by-sponsor-pie-chart.component';
import { ResearchFundingBarChartComponent } from './research-funding-bar-chart/research-funding-bar-chart.component';
import { SubmissionBasedClaimAgingComponent } from './submission-based-claim-aging/submission-based-claim-aging.component';
import { ClaimsSubmittedToSponsorByClaimStatusComponent } from './claims-submitted-to-sponsor-by-claim-status/claims-submitted-to-sponsor-by-claim-status.component';
import { AwardExpenditureByFinancialYearComponent } from './award-expenditure-by-financial-year/award-expenditure-by-financial-year.component';
import { ExpenditureByBudgetCategoryInMonthsComponent } from './expenditure-by-budget-category-in-months/expenditure-by-budget-category-in-months.component';
import { ExternalAwardByDepartmentComponent } from './external-award-by-department/external-award-by-department.component';
import { InternalAwardListComponent } from './internal-award-list/internal-award-list.component';
import { ProjectEndedButNotClosedComponent } from './project-ended-but-not-closed/project-ended-but-not-closed.component';
import { AttentionRequiredListComponent } from './attention-required-list/attention-required-list.component';
import { SummaryComponent } from './summary/summary.component';
import { PendingProposalBySponsorTypeComponent } from './pending-proposal-by-sponsor-type/pending-proposal-by-sponsor-type.component';
import { AwardBySponsorTypesComponent } from './award-by-sponsor-types/award-by-sponsor-types.component';
import { PendingProposalsAndAwardsBySponsorComponent } from './pending-proposals-and-awards-by-sponsor/pending-proposals-and-awards-by-sponsor.component';
import { ResearchSummaryCountComponent } from './research-summary-count/research-summary-count.component';
import { ResearchSummaryDailyCheckComponent } from './research-summary-daily-check/research-summary-daily-check.component';
import { InstituteProposalSubmittedByLeadUnitComponent } from './institute-proposal-submitted-by-Lead-unit/institute-proposal-submitted-by-Lead-unit.component';
import { InstituteProposalBySponsorComponent } from './institute-proposal-by-sponsor/institute-proposal-by-sponsor.component'
import { PendingIpsBySponsorTypeComponent } from './pending-ips-by-sponsor-type/pending-ips-by-sponsor-type.component';

@NgModule({
  imports: [
    CommonModule,
    ResearchSummaryWidgetsRoutingModule,
    SharedModule,
    FormsModule,
    DragDropModule
  ],
  declarations: [ResearchSummaryWidgetsComponent,
    ConfigureWidgetsComponent,
    ResearchSummaryDetailsComponent,
    ActionListComponent,
    ExpenditureVolumeChartComponent,
    FibiSupportComponent,
    AwardBySponsorTypesPiechartComponent,
    InprogressProposalsDonutChartComponent,
    ProposalBySponsorPieChartComponent,
    AwardedProposalBySponsorDonutChartComponent,
    QuickLinksComponent,
    AwardsByDepartmentLayerTableComponent,
    ClaimsSubmittedToSponsorByFYComponent,
    RecentAwardsComponent,
    UnderUtilizedAwardsComponent,
    AwardBudgetExpenseComponent,
    AwardBySponsorPieChartComponent,
    ResearchFundingBarChartComponent,
    SubmissionBasedClaimAgingComponent,
    ClaimsSubmittedToSponsorByClaimStatusComponent,
    AwardExpenditureByFinancialYearComponent,
    ExpenditureByBudgetCategoryInMonthsComponent,
    InternalAwardListComponent,
    ExternalAwardByDepartmentComponent,
    ProjectEndedButNotClosedComponent,
    AttentionRequiredListComponent,
    ProposalListByFundingSchemeComponent,
    ProposalListBySponsorComponent,
    ProposalSubmittedByLeadunitComponent,
    ProposalListByGrantcallComponent,
    PendingProposalBySponsorTypeComponent,
    AwardBySponsorTypesComponent,
    SummaryComponent,
    PendingProposalsAndAwardsBySponsorComponent,
    ResearchSummaryCountComponent,
    ResearchSummaryDailyCheckComponent,
    InstituteProposalSubmittedByLeadUnitComponent,
    InstituteProposalBySponsorComponent,
    PendingIpsBySponsorTypeComponent
  ],
  entryComponents: [ResearchSummaryDetailsComponent,
    ActionListComponent,
    ExpenditureVolumeChartComponent,
    FibiSupportComponent,
    AwardBySponsorTypesPiechartComponent,
    InprogressProposalsDonutChartComponent,
    ProposalBySponsorPieChartComponent,
    AwardedProposalBySponsorDonutChartComponent,
    QuickLinksComponent,
    AwardsByDepartmentLayerTableComponent,
    ClaimsSubmittedToSponsorByFYComponent,
    RecentAwardsComponent,
    UnderUtilizedAwardsComponent,
    AwardBudgetExpenseComponent,
    AwardBySponsorPieChartComponent,
    ResearchFundingBarChartComponent,
    SubmissionBasedClaimAgingComponent,
    ClaimsSubmittedToSponsorByClaimStatusComponent,
    AwardExpenditureByFinancialYearComponent,
    ExpenditureByBudgetCategoryInMonthsComponent,
    InternalAwardListComponent,
    ExternalAwardByDepartmentComponent,
    ProjectEndedButNotClosedComponent,
    AttentionRequiredListComponent,
    ProposalListBySponsorComponent,
    ProposalSubmittedByLeadunitComponent,
    ProposalListByGrantcallComponent,
    ProposalListByFundingSchemeComponent,
    PendingProposalBySponsorTypeComponent,
    AwardBySponsorTypesComponent,
    SummaryComponent,
    PendingProposalsAndAwardsBySponsorComponent,
    ResearchSummaryCountComponent,
    ResearchSummaryDailyCheckComponent,
    InstituteProposalSubmittedByLeadUnitComponent,
    InstituteProposalBySponsorComponent,
    PendingIpsBySponsorTypeComponent
  ],
  providers: [ResearchSummaryWidgetsService,
    GoogleChartService]
})
export class ResearchSummaryWidgetsModule { }
