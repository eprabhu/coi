import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommentsAndAttachmentsComponent } from './comments-and-attachments.component';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WafAttachmentService } from '../../common/services/waf-attachment.service';
import { CommentsService } from './comments.service';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        RouterModule.forChild(
            [
                { path: '', component: CommentsAndAttachmentsComponent }
            ]
        )
    ],
    declarations: [CommentsAndAttachmentsComponent],
    providers: [
        CommentsService,
        WafAttachmentService
    ]
})
export class CommentsAndAttachmentsModule { }
