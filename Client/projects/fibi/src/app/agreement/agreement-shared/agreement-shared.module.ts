import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonAttchmentsComponent } from './common-attchments/common-attchments.component';
import { CommonAttachmentService } from './common-attchments/common-attachment.service';
import { SharedModule } from '../../shared/shared.module';
import { ActivityComponent } from './activity-track/activity.component';
@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule
  ],
  declarations: [CommonAttchmentsComponent,ActivityComponent],
  providers: [ CommonAttachmentService],
  exports: [CommonAttchmentsComponent,ActivityComponent]
})
export class AgreementSharedModule { }
