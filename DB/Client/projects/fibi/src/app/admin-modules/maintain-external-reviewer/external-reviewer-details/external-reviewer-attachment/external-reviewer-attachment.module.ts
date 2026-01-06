import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../../../../shared/shared.module';
import { ExternalReviewerAttachmentComponent } from './external-reviewer-attachment.component';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        RouterModule.forChild([{ path: '', component: ExternalReviewerAttachmentComponent }])
    ],
    declarations: [ExternalReviewerAttachmentComponent]
})
export class ExternalReviewerAttachmentModule { }
