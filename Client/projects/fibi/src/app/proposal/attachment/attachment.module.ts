import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttachmentComponent } from './attachment.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { ProposalSharedModule } from '../proposal-shared/proposal-shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild([{path: '', component: AttachmentComponent}]),
    ProposalSharedModule,
  ],
  declarations: [AttachmentComponent],
  exports: [AttachmentComponent]
})
export class AttachmentModule { }
