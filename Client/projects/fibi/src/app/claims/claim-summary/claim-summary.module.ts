import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClaimSummaryComponent } from './claim-summary.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { ClaimSummaryService } from './claim-summary.service';
import { RouteGuardService } from './route-guard.service';

const routes: Routes = [{
    path: '', component: ClaimSummaryComponent,
    children: [
        {path: '', redirectTo: 'reimbursement', pathMatch: 'full'},
        {
            path: 'reimbursement',
            loadChildren: () => import('./reimbursement/reimbursement.module').then(m => m.ReimbursementModule),
            canActivate: [RouteGuardService]
        },
        {
            path: 'advance',
            loadChildren: () => import('./advance/advance.module').then(m => m.AdvanceModule),
            canActivate: [RouteGuardService]
        },
        {
            path: '**',
            loadChildren: () => import('../../error-handler/not-found/not-found.module').then(m => m.NotFoundModule),
        }
    ]
}];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        SharedModule,
        FormsModule
    ],
    declarations: [ClaimSummaryComponent],
    providers: [ClaimSummaryService, RouteGuardService]
})
export class ClaimSummaryModule {
}
