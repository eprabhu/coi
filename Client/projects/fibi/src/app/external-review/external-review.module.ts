import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExternalReviewComponent } from './external-review.component';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import { QuestionnaireComponent } from './questionnaire/questionnaire.component';
import { ScoringComponent } from './scoring/scoring.component';
import { FormsModule } from '@angular/forms';
import { QuestionnaireService } from './questionnaire/questionnaire.service';
import { ReviewComponent } from './review/review.component';
import { AttachmentsComponent } from './attachments/attachments.component';
import { GrantCommonDataService } from '../grant-call/services/grant-common-data.service';
import { AttachmentsService } from './attachments/attachments.service';
import { ExternalReviewService } from './external-review.service';
import { ScoringService } from './scoring/scoring.service';
import { ScoringCriteriaService } from '../grant-call/scoring-criteria/scoring-criteria.service';
@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild([{ path: '', component: ExternalReviewComponent }]),
        SharedModule,
        FormsModule,
    ],
    declarations: [
        ExternalReviewComponent,
        QuestionnaireComponent,
        ReviewComponent,
        ScoringComponent,
        AttachmentsComponent],
    providers: [
        QuestionnaireService,
        GrantCommonDataService,
        AttachmentsService,
        ExternalReviewService,
        ScoringCriteriaService,
        ScoringService],
})

export class ExternalReviewModule { }
