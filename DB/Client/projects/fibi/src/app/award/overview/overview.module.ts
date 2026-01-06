import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverviewComponent } from './overview.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { SubContractsEditComponent } from './sub-contracts/sub-contracts-edit/sub-contracts-edit.component';
import { SpecialReviewEditComponent } from './special-review/special-review-edit/special-review-edit.component';
import { AwardDetailsEditComponent } from './award-details/award-details-edit/award-details-edit.component';
import { InstituteProposalEditComponent } from './Institute-proposal/institute-proposal-edit/institute-proposal-edit.component';
import { SubContractsViewComponent } from './sub-contracts/sub-contracts-view/sub-contracts-view.component';
import { AwardDetailsViewComponent } from './award-details/award-details-view/award-details-view.component';
import { InstituteProposalViewComponent } from './Institute-proposal/institute-proposal-view/institute-proposal-view.component';
import { SpecialReviewViewComponent } from './special-review/special-review-view/special-review-view.component';
import { ContactsComponent } from './contacts/contacts.component';
import { KeyPersonService } from './key-person/key-person.service';
import { ProjectTeamService } from './project-team/project-team.service';
import { ContactService } from './contacts/contact.service';
import { KeyPersonComponent } from './key-person/key-person.component';
import { ProjectTeamComponent } from './project-team/project-team.component';
import { ProjectCostOverviewViewComponent } from './project-cost-overview/project-cost-overview-view/project-cost-overview-view.component';
import { KeyPerformanceIndicatorAwardComponent } from './key-performance-indicator-award/key-performance-indicator-award.component';
import { KeyPerformanceIndicatorAwardService } from './key-performance-indicator-award/key-performance-indicator-award.service';
import { AwardMilestoneComponent } from './award-milestone/award-milestone.component';
import { AreaOfResearchEditComponent } from './area-of-research/area-of-research-edit/area-of-research-edit.component';
import { AreaOfResearchViewComponent } from './area-of-research/area-of-research-view/area-of-research-view.component';
import { AnticipatedDistributionModule } from '../anticipated-distribution/anticipated-distribution.module';
import { SharedComponentModule } from '../../shared-component/shared-component.module';
import { AwardSharedModule } from "../award-shared/award-shared.module";
@NgModule({
    exports: [AwardDetailsEditComponent],
    declarations: [OverviewComponent,
        SubContractsEditComponent,
        SpecialReviewEditComponent,
        AwardDetailsEditComponent,
        InstituteProposalEditComponent,
        SubContractsViewComponent,
        AwardDetailsViewComponent,
        InstituteProposalViewComponent,
        SpecialReviewViewComponent,
        KeyPersonComponent,
        ProjectTeamComponent,
        ContactsComponent,
        KeyPerformanceIndicatorAwardComponent,
        ProjectCostOverviewViewComponent,
        AwardMilestoneComponent,
        AreaOfResearchEditComponent,
        AreaOfResearchViewComponent],
    providers: [KeyPersonService,
        ProjectTeamService, ContactService, KeyPerformanceIndicatorAwardService],
    imports: [
        CommonModule,
        RouterModule.forChild([{ path: '', component: OverviewComponent }]),
        SharedModule,
        FormsModule,
        AnticipatedDistributionModule,
        SharedComponentModule,
        AwardSharedModule
    ]
})
export class OverviewModule { }
