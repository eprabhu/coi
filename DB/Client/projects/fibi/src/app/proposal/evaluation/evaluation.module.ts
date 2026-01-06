import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { EvaluationComponent } from './evaluation.component';
import { EvaluationService } from './evaluation.service';
import { ProposalEvaluationComponent } from './proposal-evaluation/proposal-evaluation.component';
import { ProposalScoringComponent } from './proposal-scoring/proposal-scoring.component';
import { RouteGuardService } from './route-guard.service';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        RouterModule.forChild([
            {
                path: '',
                component: EvaluationComponent, children: [
                    { path: '', redirectTo: 'evaluate', pathMatch: 'full' },
                    { path: 'evaluate', component: ProposalEvaluationComponent,
                        canActivate: [RouteGuardService], canDeactivate: [RouteGuardService] },
                    { path: 'score', component: ProposalScoringComponent,
                        canActivate: [RouteGuardService], canDeactivate: [RouteGuardService] },
                    {
                        path: '**',
                        loadChildren: () => import('../../error-handler/not-found/not-found.module').then(m => m.NotFoundModule),
                    }
                ]
            }
        ])
    ],
    declarations: [EvaluationComponent, ProposalEvaluationComponent, ProposalScoringComponent],
    providers: [EvaluationService, RouteGuardService]
})
export class EvaluationModule {
}
