import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IpBudgetComponent } from './ip-budget.component';
import { PeriodsTotalComponent } from './periods-total/periods-total.component';
import { BudgetOverviewComponent } from './budget-overview/budget-overview.component';
import { BudgetService } from './services/budget.service';
import { BudgetDataService } from './services/budget-data.service';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild([{ path: '', component: IpBudgetComponent }])
  ],
  declarations: [IpBudgetComponent, PeriodsTotalComponent, BudgetOverviewComponent],
  providers: [BudgetService, BudgetDataService]
})
export class IpBudgetModule { }
