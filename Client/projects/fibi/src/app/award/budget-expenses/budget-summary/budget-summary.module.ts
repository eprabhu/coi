import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BudgetSummaryComponent } from './budget-summary.component';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [RouterModule.forChild([{ path: '', component: BudgetSummaryComponent }]), CommonModule,
FormsModule],
  exports: [RouterModule],
  declarations: [BudgetSummaryComponent]
})
export class BudgetSummaryModule { }
