import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProposalRoutingModule } from './proposal-routing.module';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';

import { ProposalComponent } from './proposal.component';

import { ProposalService } from './services/proposal.service';
import { RoleService } from './role/role.service';
import { EvaluationService } from './evaluation/evaluation.service';
import { QuestionnaireListService } from '../shared/view-questionnaire-list/questionnaire-list.service';

import { BudgetModule } from './budget/budget.module';
import { EvaluationApproverPopupComponent } from './evaluation-approver-popup/evaluation-approver-popup.component';
import { EvaluationApproverPopupService } from './evaluation-approver-popup/evaluation-approver-popup.service';
import { BudgetDataService } from './services/budget-data.service';
import { MergeIpComponent } from './merge-ip/merge-ip.component';
import { ReviewSectionComponent } from './review-section/review-section.component';
import { ReviewSectionService } from './review-section/review.section.service';
import { SharedComponentModule } from '../shared-component/shared-component.module';
import { DataStoreService } from './services/data-store.service';
import { ProposalSharedModule } from './proposal-shared/proposal-shared.module';
import { AttachmentModule } from './attachment/attachment.module';

@NgModule({
    imports: [
        CommonModule,
        ProposalRoutingModule,
        FormsModule,
        SharedModule,
        BudgetModule,
        SharedComponentModule,
        ProposalSharedModule,
        AttachmentModule
    ],
    declarations: [
        ProposalComponent,
        MergeIpComponent,
        ReviewSectionComponent,
        EvaluationApproverPopupComponent
    ],
    exports: [],
    providers: [
        ProposalService,
        RoleService,
        EvaluationService,
        QuestionnaireListService,
        EvaluationApproverPopupService,
        BudgetDataService,
        ReviewSectionService,
        DataStoreService
    ]
})
export class ProposalModule { }
