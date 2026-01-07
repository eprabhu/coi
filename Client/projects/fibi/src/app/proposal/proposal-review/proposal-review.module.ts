import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ProposalReviewComponent } from './proposal-review.component';
import { ProposalEvaluationComponent } from './proposal-evaluation/proposal-evaluation.component';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { ProposalSharedModule } from '../proposal-shared/proposal-shared.module';
import { ProposalSummaryComponent } from './proposal-summary/proposal-summary.component';
import { RouteGuardService } from './route-guard.service';

const routes: Routes = [{
    path: '', component: ProposalReviewComponent, children: [
        { path: '', redirectTo: 'summary', pathMatch: 'full' },
        { path: 'summary', component: ProposalSummaryComponent, canActivate: [RouteGuardService], canDeactivate: [RouteGuardService] },
        { path: 'evaluation', component: ProposalEvaluationComponent,
            canActivate: [RouteGuardService], canDeactivate: [RouteGuardService] },
        {
            path: 'external-review', canActivate: [RouteGuardService],
            loadChildren: () => import('../../external-review/external-review.module').then(m => m.ExternalReviewModule),
            data: {moduleItemCode: 3, moduleSubItemCode: 0, dynModuleCode: 'DP03'}
        },
        {
            path: '**',
            loadChildren: () => import('../../error-handler/not-found/not-found.module').then(m => m.NotFoundModule),
        },

    ]
}];

@NgModule({
    declarations: [ProposalReviewComponent, ProposalEvaluationComponent, ProposalSummaryComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        SharedModule,
        FormsModule,
        ProposalSharedModule
    ],
    providers: [RouteGuardService]
})
export class ProposalReviewModule {
}
