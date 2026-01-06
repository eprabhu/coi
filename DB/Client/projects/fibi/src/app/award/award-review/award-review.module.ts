import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AwardReviewComponent } from './award-review.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: AwardReviewComponent }]),
    SharedModule,
    FormsModule
  ],
  declarations: [AwardReviewComponent]
})
export class AwardReviewModule { }
