import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProposalComparisonComponent } from './proposal-comparison.component';
import { RouterModule } from '@angular/router';
import { ToolKitComponent } from './tool-kit/tool-kit.component';
import { ToolKitService } from './tool-kit/tool-kit.service';
import { DateParserService } from '../../common/services/date-parser.service';
import { SharedModule } from '../../shared/shared.module';
import { CurrencyParserService } from '../../common/services/currency-parser.service';
import { FormsModule } from '@angular/forms';
import { OverviewComponent } from './review/overview/overview.component';
import { MilestoneComponent } from './review/overview/milestone/milestone.component';
import { KeyPerformanceIndicatorComponent } from './review/overview/key-performance-indicator/key-performance-indicator.component';
import { ToolkitEventInteractionService } from './toolkit-event-interaction.service';
import { AttachmentComponent } from './review/attachment/attachment.component';
import { OtherInformationComponent } from './review/other-information/other-information.component';
import { BudgetComparisonComponent } from './review/budget-comparison/budget-comparison.component';
import { QuestionnaireComponent } from './review/questionnaire/questionnaire.component';
import { KeyPersonnelComponent } from './review/overview/key-personnel/key-personnel.component';
import { GeneralInformationComponent } from './review/overview/general-information/general-information.component';
import { OrganizationComponent } from './review/overview/organization/organization.component';
import { SpecialReviewComponent } from './review/overview/special-review/special-review.component';
import { AreaOfResearchComponent } from './review/overview/area-of-research/area-of-research.component';
import { ReviewComponent } from './review/review.component';
import { CommentsComponent } from './review/overview/comments/comments.component';
import { SharedComponentModule } from '../../shared-component/shared-component.module';
@NgModule({
  imports: [
    RouterModule.forChild([
      { path: '', component: ProposalComparisonComponent }
    ]),
    CommonModule,
    SharedModule,
    FormsModule,
    SharedComponentModule
  ],
  declarations: [
    ProposalComparisonComponent, ToolKitComponent, ReviewComponent, OverviewComponent,
    KeyPersonnelComponent, MilestoneComponent, AreaOfResearchComponent, SpecialReviewComponent,
    OrganizationComponent, KeyPerformanceIndicatorComponent, GeneralInformationComponent,
    AttachmentComponent, OtherInformationComponent, QuestionnaireComponent, BudgetComparisonComponent, CommentsComponent],
  providers: [ToolKitService, DateParserService, CurrencyParserService, ToolkitEventInteractionService]
})
export class ProposalComparisonModule { }
