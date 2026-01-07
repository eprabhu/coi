import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoInformationComponent } from './no-information/no-information.component';
import { MatIconModule } from '@angular/material/icon';
import { PersonalDetailsModalComponent } from './personal-details-modal/personal-details-modal.component';
import { PersonDetailsComponent } from './personal-details-modal/person-details/person-details.component';
import { TrainingDetailsComponent } from './personal-details-modal/Training-details/Training-details.component';
import { SharedModule } from '../shared/shared.module';
import { SharedSfiCardComponent } from './shared-sfi-card/shared-sfi-card.component';
import { DisclosureCreateModalComponent } from './disclosure-create-modal/disclosure-create-modal.component';
import { FormsModule } from '@angular/forms';
import { AssignAdministratorModalComponent } from './assign-administrator-modal/assign-administrator-modal.component';
import { SliderCloseBtnComponent } from './slider-close-btn/slider-close-btn.component';
import { ActivateInactivateSfiModalComponent } from './activate-inactivate-sfi-modal/activate-inactivate-sfi-modal.component';
import { ConfirmationModalComponent } from './confirmation-modal/confirmation-modal.component';
import { EntityRiskSliderComponent } from './entity-risk-slider/entity-risk-slider.component';
import { ReviewCommentsSliderComponent } from './review-comments-slider/review-comments-slider.component';
import { CoiSliderComponent } from './coi-slider/coi-slider.component';
import { HelpTextComponent } from './help-text/help-text.component';
import { PersonProjectEntityCardComponent } from './person-project-entity-card/person-project-entity-card.component';
import { ReviewCommentListViewComponent } from './review-comment-list-view/review-comment-list-view.component';
import { ConcurrencyWarningModalComponent } from './concurrency-warning-modal/concurrency-warning-modal.component';
import { EntityDetailsCardComponent } from './entity-details-card/entity-details-card.component';
import { SharedProjectDetailsModalComponent } from './shared-project-details-modal/shared-project-details-modal.component';
import { CommonModalComponent } from './common-modal/common-modal.component';
import { ScrollSpyComponent } from './scroll-spy/scroll-spy.component';
import { CoiCountModalComponent } from './coi-count-modal/coi-count-modal.component';
import { SharedAttachmentModalComponent } from './shared-attachment-modal/shared-attachment-modal.component';
import { ProjectHierarchySliderComponent } from './project-hierarchy-slider/project-hierarchy-slider.component';
import { ProjectHierarchyComponent } from './project-hierarchy-slider/project-hierarchy/project-hierarchy.component';
import { SharedProjectDetailsCardComponent } from './shared-project-details-card/shared-project-details-card.component';
import { DisclosureProjectKeyPersonComponent } from './disclosure-project-key-person/disclosure-project-key-person.component';
import { SharedRiskHistoryComponent } from './shared-risk-history/shared-risk-history.component';
import { SharedAttachmentComponent } from './shared-attachment/shared-attachment.component';
import { SharedEntityBatchCardComponent } from './shared-entity-batch-card/shared-entity-batch-card.component';
import { SharedEntityDetailsCardComponent } from './shared-entity-details-card/shared-entity-details-card.component';
import { ActionListSliderComponent } from './action-list-slider/action-list-slider.component';
import { NotesListComponent } from './notes-list/notes-list.component';
import { NotesEditSliderComponent } from './notes-edit-slider/notes-edit-slider.component';
import { ConfigurableProjectListComponent } from './configurable-project-list/configurable-project-list.component';
import { ProjectDisclosureCreateModalComponent } from './project-disclosure-create-modal/project-disclosure-create-modal.component';
import { SharedEntityCreationModalComponent } from './shared-entity-creation-modal/shared-entity-creation-modal.component';
import { CoiNotificationBannerComponent } from './coi-notification-banner/coi-notification-banner.component';
import { CoiSectionCardComponent } from './coi-section-card/coi-section-card.component';
import { CoiValidationModalComponent } from './coi-validation-modal/coi-validation-modal.component';
import { CoiCustomElementAutosaveComponent } from './coi-custom-element-autosave/coi-custom-element-autosave.component';
import { RolodexDetailsComponent } from './personal-details-modal/rolodex-details/rolodex-details.component';
import { CoiReviewCommentsComponent } from './coi-review-comments/coi-review-comments.component';
import { CoiReviewCommentsCardComponent } from './coi-review-comments/coi-review-comments-card/coi-review-comments-card.component';
import { CoiReviewCommentsEditorComponent } from './coi-review-comments/coi-review-comments-editor/coi-review-comments-editor.component';
import { SharedEntireDisclosureHistoryComponent } from './shared-entire-disclosure-history/shared-entire-disclosure-history.component';
import { EntityDetailsModalComponent } from './entity-details-modal/entity-details-modal.component';
import { CompleteDisclosuresHistorySliderComponent } from './complete-disclosures-history-slider/complete-disclosures-history-slider.component';
import { CoiLeavePageModalComponent } from './coi-leave-page-modal/coi-leave-page-modal.component';
import { SharedEntityInfoCardComponent } from './shared-entity-info-card/shared-entity-info-card.component';
import { CoiReviewCommentsSliderComponent } from './coi-review-comments-slider/coi-review-comments-slider.component';
import { CommonExtendedBadgeComponent } from './common-extended-badge/common-extended-badge.component';
import { CommonForeignFlagComponent } from './common-foreign-flag/common-foreign-flag.component';
import { CoiFieldCompareComponent } from './coi-field-compare/coi-field-compare.component';
import { WorkflowEngineComponent2 } from './workflow-engine2/workflow-engine.component';
import { IconMapComponent } from './workflow-engine2/icon-map/app-icon-map.component';
import { AdhocCommentComponent } from './workflow-engine2/adhoc-comment/adhoc-comment.component';
import { CoiDisclosureDashboardCardComponent } from './coi-disclosure-dashboard-card/coi-disclosure-dashboard-card.component';
import { CoiStepsNavigationComponent } from './coi-steps-navigation/coi-steps-navigation.component';
import { CoiPrintModalComponent } from './coi-print-modal/coi-print-modal.component';
import { DeclarationCardComponent } from './declaration-card/declaration-card.component';
import { DynamicSelectComponent } from './dynamic-select/dynamic-select.component';
import { DuplicateEntityCheckService } from '../entity-management-module/shared/duplicate-entity-check/duplicate-entity-check.service';
import { ManagementPlanCardComponent } from '../conflict-management-plan/shared/management-plan-card/management-plan-card.component';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    SharedModule,
    FormsModule,
    ManagementPlanCardComponent
  ],
  declarations: [
    NoInformationComponent,
    PersonalDetailsModalComponent,
    PersonDetailsComponent,
    RolodexDetailsComponent,
    TrainingDetailsComponent,
    SharedSfiCardComponent,
    DisclosureCreateModalComponent,
    AssignAdministratorModalComponent,
    SliderCloseBtnComponent,
    ActivateInactivateSfiModalComponent,
    ConfirmationModalComponent,
    ReviewCommentsSliderComponent,
    CoiSliderComponent,
    HelpTextComponent,
    PersonProjectEntityCardComponent,
    EntityRiskSliderComponent,
    ReviewCommentListViewComponent,
    ConcurrencyWarningModalComponent,
    SharedProjectDetailsModalComponent,
    EntityDetailsCardComponent,
    CommonModalComponent,
    ScrollSpyComponent,
    CoiCountModalComponent,
    SharedAttachmentModalComponent,
    ProjectHierarchySliderComponent,
    ProjectHierarchyComponent,
    SharedProjectDetailsCardComponent,
    DisclosureProjectKeyPersonComponent,
    SharedRiskHistoryComponent,
    ActionListSliderComponent,
    SharedAttachmentComponent,
    SharedEntityBatchCardComponent,
    SharedEntityDetailsCardComponent,
    NotesListComponent,
    NotesEditSliderComponent,
    ConfigurableProjectListComponent,
    ProjectDisclosureCreateModalComponent,
    SharedEntityCreationModalComponent,
    CoiNotificationBannerComponent,
    CoiSectionCardComponent,
    CoiValidationModalComponent,
    CoiCustomElementAutosaveComponent,
    SharedEntireDisclosureHistoryComponent,
    EntityDetailsModalComponent,
    CoiReviewCommentsComponent,
    CoiReviewCommentsCardComponent,
    CoiReviewCommentsEditorComponent,
    CompleteDisclosuresHistorySliderComponent,
    CoiLeavePageModalComponent,
    SharedEntityInfoCardComponent,
    CoiReviewCommentsSliderComponent,
    CommonExtendedBadgeComponent,
    CommonForeignFlagComponent,
    CoiFieldCompareComponent,
    WorkflowEngineComponent2,
    IconMapComponent,
    AdhocCommentComponent,
    CoiDisclosureDashboardCardComponent,
    CoiStepsNavigationComponent,
    CoiPrintModalComponent,
    DeclarationCardComponent,
    DynamicSelectComponent
  ],
  exports: [
    NoInformationComponent,
    PersonalDetailsModalComponent,
    PersonDetailsComponent,
    RolodexDetailsComponent,
    TrainingDetailsComponent,
    SharedSfiCardComponent,
    DisclosureCreateModalComponent,
    AssignAdministratorModalComponent,
    SliderCloseBtnComponent,
    ActivateInactivateSfiModalComponent,
    ConfirmationModalComponent,
    ReviewCommentsSliderComponent,
    CoiSliderComponent,
    HelpTextComponent,
    PersonProjectEntityCardComponent,
    EntityRiskSliderComponent,
    ReviewCommentListViewComponent,
    ConcurrencyWarningModalComponent,
    EntityDetailsCardComponent,
    SharedProjectDetailsModalComponent,
    CommonModalComponent,
    ScrollSpyComponent,
    CoiCountModalComponent,
    SharedAttachmentModalComponent,
    ProjectHierarchySliderComponent,
    ProjectHierarchyComponent,
    SharedProjectDetailsCardComponent,
    DisclosureProjectKeyPersonComponent,
    SharedRiskHistoryComponent,
    ActionListSliderComponent,
    SharedAttachmentComponent,
    SharedEntityBatchCardComponent,
    SharedEntityDetailsCardComponent,
    NotesListComponent,
    NotesEditSliderComponent,
    ConfigurableProjectListComponent,
    ProjectDisclosureCreateModalComponent,
    SharedEntityCreationModalComponent,
    CoiNotificationBannerComponent,
    CoiSectionCardComponent,
    CoiValidationModalComponent,
    CoiCustomElementAutosaveComponent,
    SharedEntireDisclosureHistoryComponent,
    EntityDetailsModalComponent,
    CoiReviewCommentsComponent,
    CoiReviewCommentsCardComponent,
    CoiReviewCommentsEditorComponent,
    CompleteDisclosuresHistorySliderComponent,
    CoiLeavePageModalComponent,
    SharedEntityInfoCardComponent,
    CoiReviewCommentsSliderComponent,
    CommonExtendedBadgeComponent,
    CommonForeignFlagComponent,
    CoiFieldCompareComponent,
    WorkflowEngineComponent2,
    IconMapComponent,
    AdhocCommentComponent,
    CoiDisclosureDashboardCardComponent,
    CoiStepsNavigationComponent,
    CoiPrintModalComponent,
    DeclarationCardComponent,
    DynamicSelectComponent
  ],
  providers:[DuplicateEntityCheckService]
})
export class SharedComponentModule { }
