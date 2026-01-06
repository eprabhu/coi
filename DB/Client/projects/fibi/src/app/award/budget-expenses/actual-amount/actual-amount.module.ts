import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActualAmountComponent } from './actual-amount.component';
import { FormsModule } from '@angular/forms';
import { SharedModule } from './../../../shared/shared.module';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild([{ path: '', component: ActualAmountComponent}])
  ],
  declarations: [ActualAmountComponent]
})
export class ActualAmountModule { }
