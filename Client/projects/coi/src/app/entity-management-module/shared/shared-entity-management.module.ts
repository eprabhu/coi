import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { SharedComponentModule } from '../../shared-components/shared-component.module';
import { EntityDunsCardComponent } from './entity-duns-card/entity-duns-card.component';
import { EntityRiskSectionComponent } from './entity-risk-section/entity-risk-section.component';
import { FormsModule } from '@angular/forms';
import { EntityAttachmentSectionModule } from './entity-attachment-section/entity-attachment-section.module';
import { DuplicateEntityCheckComponent } from './duplicate-entity-check/duplicate-entity-check.component';
import { DuplicateMarkingConfirmationComponent } from './duplicate-marking-confirmation/duplicate-marking-confirmation.component';
import { EntityDetailsPopupCardComponent } from './entity-details-popup-card/entity-details-popup-card.component';
import { RiskEditHistorySlider } from './entity-risk-section/risk-edit-history-slider/risk-edit-history-slider.component';
import { EntityCommonQuestionnaireComponent } from './entity-common-questionnaire/entity-common-questionnaire.component';
import { EntityCommonNotesSectionComponent } from './entity-common-notes-section/entity-common-notes-section.component';
import { EntityReviewCommentsSliderComponent } from './entity-review-comments-slider/entity-review-comments-slider.component';

@NgModule({
    declarations: [
        EntityDunsCardComponent,
        EntityRiskSectionComponent,
        DuplicateEntityCheckComponent,
        DuplicateMarkingConfirmationComponent,
        EntityDetailsPopupCardComponent,
        RiskEditHistorySlider,
        EntityCommonQuestionnaireComponent,
        EntityCommonNotesSectionComponent,
        EntityReviewCommentsSliderComponent
    ],
    imports: [
        FormsModule,
        CommonModule,
        SharedModule,
        SharedComponentModule,
        EntityAttachmentSectionModule
    ],
    exports: [
        EntityDunsCardComponent,
        EntityRiskSectionComponent,
        EntityAttachmentSectionModule,
        DuplicateEntityCheckComponent,
        EntityDetailsPopupCardComponent,
        DuplicateMarkingConfirmationComponent,
        RiskEditHistorySlider,
        EntityCommonQuestionnaireComponent,
        EntityCommonNotesSectionComponent,
        EntityReviewCommentsSliderComponent
    ]
})
export class SharedEntityManagementModule { }
