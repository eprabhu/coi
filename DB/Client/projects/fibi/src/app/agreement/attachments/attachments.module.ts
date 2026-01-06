import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttachmentsComponent } from './attachments.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { AttachmentsService } from './attachments.service';
import { AgreementSharedModule } from '../agreement-shared/agreement-shared.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: AttachmentsComponent }]),
    FormsModule,
    SharedModule,
    AgreementSharedModule
  ],
  declarations: [AttachmentsComponent],
  providers: [AttachmentsService]
})
export class AttachmentsModule { }
