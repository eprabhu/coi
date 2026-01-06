import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { BudgetExpensesComponent } from './budget-expenses.component';
import { ExpenseEditComponent } from './expense-edit/expense-edit.component';
import { PersonDetailsComponent } from './expense-edit/person-details/person-details.component';
import { RevenueDetailsComponent } from './expense-edit/revenue-details/revenue-details.component';
import { RouteGuardService } from './route-guard.service';
import { AnticipatedDistributionModule } from '../anticipated-distribution/anticipated-distribution.module';

const routes: Routes = [{
    path: '', component: BudgetExpensesComponent,
    children: [
        {path: '', redirectTo: 'budget', pathMatch: 'full'},
        {
            path: 'expensetrack', component: ExpenseEditComponent,
            canActivate: [RouteGuardService], canDeactivate: [RouteGuardService]
        },
        {
            path: 'purchase', component: ExpenseEditComponent,
            canActivate: [RouteGuardService], canDeactivate: [RouteGuardService]
        },
        {
            path: 'revenue', component: RevenueDetailsComponent,
            canActivate: [RouteGuardService], canDeactivate: [RouteGuardService]
        },
        {
            path: 'budget',
            loadChildren: () => import('../budget-expenses/award-budget/award-budget.module').then(m => m.AwardBudgetModule),
            canActivate: [RouteGuardService], canDeactivate: [RouteGuardService]
        },
        {
            path: 'revenue-amount',
            loadChildren: () => import('./revenue-amount/revenue-amount.module').then(m => m.RevenueAmountModule),
            canActivate: [RouteGuardService], canDeactivate: [RouteGuardService]
        },
        {
            path: 'committed-amount',
            loadChildren: () => import('./committed-amount/committed-amount.module').then(m => m.CommittedAmountModule),
            canActivate: [RouteGuardService], canDeactivate: [RouteGuardService]
        },
        {
            path: 'actual-amount',
            loadChildren: () => import('./actual-amount/actual-amount.module').then(m => m.ActualAmountModule),
            canActivate: [RouteGuardService], canDeactivate: [RouteGuardService]
        },
        {
            path: 'claims',
            loadChildren: () => import('./claims/claims.module').then(m => m.ClaimsModule),
            canActivate: [RouteGuardService], canDeactivate: [RouteGuardService]
        },
        {
            path: 'budget-summary',
            loadChildren: () => import('./budget-summary/budget-summary.module').then(m => m.BudgetSummaryModule),
            canActivate: [RouteGuardService], canDeactivate: [RouteGuardService]
        },
        {
            path: '**', loadChildren: () => import('../../error-handler/not-found/not-found.module').then(m => m.NotFoundModule),
        }
    ]
}];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        SharedModule,
        FormsModule,
        AnticipatedDistributionModule
    ],
    declarations: [BudgetExpensesComponent, ExpenseEditComponent, PersonDetailsComponent, RevenueDetailsComponent],
    providers: [RouteGuardService]
})
export class BudgetExpensesModule {
}
