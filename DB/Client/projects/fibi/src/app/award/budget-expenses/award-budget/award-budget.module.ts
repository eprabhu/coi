import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AwardBudgetComponent } from './award-budget.component';
import { BudgetOverviewComponent } from './budget-overview/budget-overview.component';
import { RouterModule, Routes } from '@angular/router';
import { PeriodsTotalComponent } from './periods-total/periods-total.component';
import { PersonnelComponent } from './personnel/personnel.component';
import { DetailedBudgetComponent } from './detailed-budget/detailed-budget.component';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { PersonnelService } from './personnel/personnel.service';
import { BudgetSummaryComponent } from './budget-summary/budget-summary.component';
import { SubrouteGuardService } from './subroute-guard.service';

const routes: Routes = [{
    path: '', component: AwardBudgetComponent,
    children: [
        {path: '', redirectTo: 'detailed-budget', pathMatch: 'full'},
        {
            path: 'periods-total', component: PeriodsTotalComponent,
            canActivate: [SubrouteGuardService], canDeactivate: [SubrouteGuardService]
        },
        {
            path: 'personnel', component: PersonnelComponent,
            canActivate: [SubrouteGuardService], canDeactivate: [SubrouteGuardService]
        },
        {
            path: 'detailed-budget', component: DetailedBudgetComponent,
            canActivate: [SubrouteGuardService], canDeactivate: [SubrouteGuardService]
        },
        {
            path: 'summary', component: BudgetSummaryComponent,
            canActivate: [SubrouteGuardService], canDeactivate: [SubrouteGuardService]
        },
        {
            path: '**', loadChildren: () => import('../../../error-handler/not-found/not-found.module').then(m => m.NotFoundModule),
        }
        // TODO lazy load module for '**'

    ]
}];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,
        SharedModule
    ],
    declarations: [AwardBudgetComponent,
        BudgetOverviewComponent,
        PeriodsTotalComponent,
        PersonnelComponent,
        DetailedBudgetComponent,
        BudgetSummaryComponent],
    providers: [PersonnelService, SubrouteGuardService]

})
export class AwardBudgetModule { }
