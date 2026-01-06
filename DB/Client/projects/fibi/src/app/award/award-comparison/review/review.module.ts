import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReviewComponent } from './review.component';
import { OverviewComponent } from './overview/overview.component';
import { AttachmentsComponent } from './attachments/attachments.component';
import { CostShareComponent } from './cost-share/cost-share.component';
import { PaymentsComponent } from './overview/payments/payments.component';
import { SponsorTermsComponent } from './sponsor-terms/sponsor-terms.component';
import { ContactsComponent } from './overview/contacts/contacts.component';
import { GeneralInformationComponent } from './overview/general-information/general-information.component';
import { KeyPersonComponent } from './overview/key-person/key-person.component';
import { ProjectTeamComponent } from './overview/project-team/project-team.component';
import { SpecialReviewComponent } from './overview/special-review/special-review.component';
import { SubContractsComponent } from './overview/sub-contracts/sub-contracts.component';
import { KeyPerformanceIndicatorComponent } from './overview/key-performance-indicator/key-performance-indicator.component';
import { MilestoneComponent } from './overview/milestone/milestone.component';
import { ProjectOutcomeComponent } from './project-outcome/project-outcome.component';
import { SpecialApprovalComponent } from './special-approval/special-approval.component';
import { DatesAmountsComponent } from './dates-amounts/dates-amounts.component';
import { SharedModule } from '../../../shared/shared.module';
import { AreaOfResearchComponent } from './overview/area-of-research/area-of-research.component';
import { ProjectCostOverviewViewComponent } from './project-cost-overview-view/project-cost-overview-view.component';
import { BudgetComparisonComponent } from './budget-comparison/budget-comparison.component';
import { CommentModule } from '../comment/comment.module';
import { QuestionnaireComponent } from './questionnaire/questionnaire.component';
import { OtherInformationComponent } from './other-information/other-information.component';
import { PermissionsComponent } from './permissions/permissions.component';
import { ManpowerComponent } from './manpower-comparison/manpower-comparison.component';
import { OrcidComparisonComponent } from './orcid-comparison/orcid-comparison.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    CommentModule,
    RouterModule.forChild([
      { path: 'review', component: ReviewComponent}
    ]),
  ],
  declarations: [ReviewComponent, AttachmentsComponent, CostShareComponent,
    OverviewComponent, PaymentsComponent, SponsorTermsComponent, ContactsComponent,
    GeneralInformationComponent, KeyPersonComponent, ProjectTeamComponent,
    SpecialReviewComponent, SubContractsComponent, KeyPerformanceIndicatorComponent,
    MilestoneComponent, AreaOfResearchComponent, BudgetComparisonComponent,
    DatesAmountsComponent, ProjectOutcomeComponent, SpecialApprovalComponent,
    ProjectCostOverviewViewComponent, QuestionnaireComponent, OtherInformationComponent,
    PermissionsComponent, ManpowerComponent, OrcidComparisonComponent
  ],
})
export class ReviewModule { }
