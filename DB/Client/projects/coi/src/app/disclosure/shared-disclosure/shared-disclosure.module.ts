import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewerActionModalComponent } from './reviewer-action-modal/reviewer-action-modal.component';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule
  ],
  declarations: [ReviewerActionModalComponent],
  exports: [ReviewerActionModalComponent],
  providers: []
})
export class SharedDisclosureModule { }
