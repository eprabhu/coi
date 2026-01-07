import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttachmentsComponent } from './attachments.component';
import { RouterModule } from '@angular/router';
import { AttachmentsEditComponent } from './attachments-edit/attachments.component';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { AttachmentsService } from './attachments.service';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: AttachmentsEditComponent }]),
    SharedModule,
    FormsModule
  ],
  declarations: [AttachmentsComponent, AttachmentsEditComponent],
  providers: [AttachmentsService]
})
export class AttachmentsModule { }
