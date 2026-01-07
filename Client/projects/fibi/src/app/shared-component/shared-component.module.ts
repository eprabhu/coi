import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ProgressReportCreateModalComponent } from './progress-report-create-modal/progress-report-create-modal.component';
import { DATE_PICKER_FORMAT } from '../app-constants';
import { SharedModule } from '../shared/shared.module';
import {
    CertificationNotificationLogModalComponent
} from './certification-notification-log-modal/certification-notification-log-modal.component';
import { LinkComplianceSpecialReviewComponent } from './link-compliance-special-review-modal/link-compliance-special-review.component';
import { LinkComplianceViewComponent } from './special-review-view/special-review-view.component';
import { UnsavedChangeWarningComponent } from './unsaved-change-warning/unsaved-change-warning.component';
import { PersonRolodexViewComponent } from './person-rolodex-view/person-rolodex-view.component';
import { RouterModule } from '@angular/router';
import { PersonRolodexCardComponent } from './person-rolodex-card/person-rolodex-card.component';
import { DegreeDetailsComponent } from './person-rolodex-view/degree-details/degree-details.component';
import { PersonRolodexDetailsComponent } from './person-rolodex-view/person-rolodex-details/person-rolodex-details.component';
import { TrainingDetailsComponent } from './person-rolodex-view/training-details/training-details.component';
import { SharedCommentComponent } from './shared-comment/shared-comment.component';

@NgModule({
    declarations: [ProgressReportCreateModalComponent,
        CertificationNotificationLogModalComponent,
        SharedCommentComponent,
        LinkComplianceSpecialReviewComponent,
        LinkComplianceViewComponent,
        UnsavedChangeWarningComponent,
        PersonRolodexViewComponent,
        PersonRolodexCardComponent,
        DegreeDetailsComponent,
        PersonRolodexDetailsComponent,
        TrainingDetailsComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        RouterModule
    ],
    exports: [ProgressReportCreateModalComponent,
        CertificationNotificationLogModalComponent,
        SharedCommentComponent,
        LinkComplianceSpecialReviewComponent,
        LinkComplianceViewComponent,
        UnsavedChangeWarningComponent,
        PersonRolodexViewComponent,
        PersonRolodexCardComponent
    ],
    providers: []
})

export class SharedComponentModule {
}
