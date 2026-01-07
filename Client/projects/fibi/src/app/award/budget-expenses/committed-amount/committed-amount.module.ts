import { SharedModule } from './../../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CommittedAmountComponent } from './committed-amount.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild([{ path: '', component: CommittedAmountComponent}])
  ],
  declarations: [CommittedAmountComponent]
})
export class CommittedAmountModule { }
