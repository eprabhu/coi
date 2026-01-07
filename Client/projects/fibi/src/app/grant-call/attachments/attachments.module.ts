import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttachmentsComponent } from './attachments.component';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AttachmentsService } from './attachments.service';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: AttachmentsComponent }]),
    SharedModule,
    FormsModule,
  ],
  declarations: [AttachmentsComponent],
  providers: [AttachmentsService]
})
export class AttachmentsModule { }
