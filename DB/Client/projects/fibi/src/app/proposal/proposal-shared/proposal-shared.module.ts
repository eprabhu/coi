import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { QuestionnaireCommonComponent } from './questionnaire-common/questionnaire.component';
import { SharedModule } from '../../shared/shared.module';
import { SharedComponentModule } from '../../shared-component/shared-component.module';
import { AddAttachmentComponent } from '../add-attachment/add-attachment.component';
import { QuestionnaireService } from './questionnaire-common/questionnaire.service';
import { GeneralProposalInformationComponent } from '../proposal-home/proposal-home-view/general-proposal-information/general-proposal-information.component';
import { KeyPersonnelDetailsComponent } from '../proposal-home/proposal-home-view/key-personnel-details/key-personnel-details.component';
import { ProjectTeamDetailsComponent } from '../proposal-home/proposal-home-view/project-team-details/project-team-details.component';
import { SpecialReviewDetailsViewComponent } from '../proposal-home/proposal-home-view/special-review-details-view/special-review-details-view.component';
import { DeclarationDetailsViewComponent } from '../proposal-home/proposal-home-view/declaration-details-view/declaration-details-view.component';
import { AreaOfResearchViewComponent } from '../proposal-home/proposal-home-view/area-of-research-view/area-of-research-view.component';
import { OrganizationViewComponent } from '../proposal-home/proposal-home-view/organization-view/organization-view.component';
import { KeyPerformanceIndicatorProposalComponent } from '../proposal-home/proposal-home-edit/key-performance-indicator-proposal/key-performance-indicator-proposal.component';
import { MilestoneComponent } from '../milestone/milestone.component';
import { OrderrByPipe } from '../milestone/directives/orderBy.pipe';
import { DeclarationComponent } from '../proposal-home/proposal-home-edit/declaration/declaration.component';
import { ProposalOverviewModalCardComponent } from './proposal-overview-modal-card/proposal-overview-modal-card.component';

@NgModule({
    declarations: [
        QuestionnaireCommonComponent,
        AddAttachmentComponent,
        GeneralProposalInformationComponent,
        KeyPersonnelDetailsComponent,
        ProjectTeamDetailsComponent,
        SpecialReviewDetailsViewComponent,
        DeclarationDetailsViewComponent,
        AreaOfResearchViewComponent,
        OrganizationViewComponent,
        KeyPerformanceIndicatorProposalComponent,
        MilestoneComponent,
        OrderrByPipe,
        DeclarationComponent,
        ProposalOverviewModalCardComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        RouterModule,
        SharedComponentModule
    ],
    providers: [
        QuestionnaireService
    ],
    exports: [
        QuestionnaireCommonComponent,
        AddAttachmentComponent,
        GeneralProposalInformationComponent,
        KeyPersonnelDetailsComponent,
        ProjectTeamDetailsComponent,
        SpecialReviewDetailsViewComponent,
        DeclarationDetailsViewComponent,
        AreaOfResearchViewComponent,
        OrganizationViewComponent,
        KeyPerformanceIndicatorProposalComponent,
        MilestoneComponent,
        OrderrByPipe,
        DeclarationComponent,
        ProposalOverviewModalCardComponent
    ]
})
export class ProposalSharedModule {
}
