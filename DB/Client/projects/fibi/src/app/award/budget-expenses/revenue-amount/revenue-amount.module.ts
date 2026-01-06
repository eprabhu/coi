import { SharedModule } from './../../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RevenueAmountComponent } from './revenue-amount.component';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild([{ path: '', component: RevenueAmountComponent}])
  ],
  declarations: [RevenueAmountComponent]
})
export class RevenueAmountModule { }
