import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttachmentsComponent } from './attachments.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: AttachmentsComponent }]),
    SharedModule,
    FormsModule
  ],
  declarations: [AttachmentsComponent]
})
export class AttachmentsModule { }
