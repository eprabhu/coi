import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BudgetComponent } from './budget.component';
import { BudgetService } from './budget.service';
import { SharedModule } from '../../shared/shared.module';
import { BudgetVersionsListComponent } from './budget-versions-list/budget-versions-list.component';
import { BudgetOverviewComponent } from './budget-overview/budget-overview.component';
import { PeriodsTotalComponent } from './periods-total/periods-total.component';
import { BudgetSummaryComponent } from './budget-summary/budget-summary.component';
import { PersonnelComponent } from './personnel/personnel.component';
import { FormsModule } from '@angular/forms';
import { PersonnelService } from './personnel/personnel.service';
import { RouterModule, Routes } from '@angular/router';
import { SimpleBudgetComponent } from './simple-budget/simple-budget.component';
import { ModularBudgetComponent } from './modular-budget/modular-budget.component';
import { CategoryTotalComponent } from './category-total/category-total.component';
import { DetailedBudgetComponent } from './detailed-budget/detailed-budget.component';
import { LineItemsComponent } from './line-items/line-items.component';
import { PersonnelLineItemsComponent } from './personnel-line-items/personnel-line-items.component';
import { ModularBudgetService } from './modular-budget/modular-budget.service';
import { RouteGuardService } from './route-guard.service';
import { PeriodUpdateComponent } from './period-update/period-update.component';
import { SharedComponentModule } from '../../shared-component/shared-component.module';

export const budgetRoutes: Routes = [
  { path: '', component: BudgetComponent,
    children: [
      { path: '', redirectTo: 'periods-total', pathMatch: 'full'},
      { path: 'periods-total', component: PeriodsTotalComponent, canActivate: [RouteGuardService], canDeactivate: [RouteGuardService]},
      { path: 'personnel', component: PersonnelComponent, canActivate: [RouteGuardService], canDeactivate: [RouteGuardService]},
      { path: 'detailed-budget', component: DetailedBudgetComponent, canActivate: [RouteGuardService], canDeactivate: [RouteGuardService]},
      { path: 'simple-budget', component: SimpleBudgetComponent, canActivate: [RouteGuardService], canDeactivate: [RouteGuardService]},
      { path: 'modular-budget', component: ModularBudgetComponent, canActivate: [RouteGuardService], canDeactivate: [RouteGuardService]},
      { path: 'category-total', component: CategoryTotalComponent, canActivate: [RouteGuardService], canDeactivate: [RouteGuardService]},
      { path: 'summary', component: BudgetSummaryComponent, canActivate: [RouteGuardService], canDeactivate: [RouteGuardService]},
      { path: '**', loadChildren: () => import('../../error-handler/not-found/not-found.module').then(m => m.NotFoundModule) }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
     RouterModule.forChild(budgetRoutes),
    FormsModule,
    SharedComponentModule
  ],
  declarations: [BudgetComponent,
    BudgetVersionsListComponent,
    BudgetOverviewComponent,
    PeriodsTotalComponent,
    DetailedBudgetComponent,
    SimpleBudgetComponent,
    PersonnelComponent,
    ModularBudgetComponent,
    CategoryTotalComponent,
    BudgetSummaryComponent,
    LineItemsComponent,
    PersonnelLineItemsComponent,
    PeriodUpdateComponent
  ],
  providers: [BudgetService, PersonnelService, ModularBudgetService, RouteGuardService],
  exports: [BudgetComponent, BudgetSummaryComponent, PeriodsTotalComponent]
})
export class BudgetModule { }






