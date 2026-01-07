import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { MaintainExternalReviewerComponent } from './maintain-external-reviewer.component';
import { SharedModule } from '../../shared/shared.module';
import { ExtReviewerMaintenanceService } from './external-reviewer-maintenance-service';

const routes: Routes = [
    {
        path: '', component: MaintainExternalReviewerComponent,
        children: [
            { path: '', redirectTo: 'external-reviewer-list', pathMatch: 'full' },
            {
                path: 'external-reviewer-list', loadChildren: () => import('./external-reviewer-list/external-reviewer-list.module')
                    .then(m => m.ExternalReviewerListModule)
            },
            {
                path: 'external-reviewer-details', loadChildren: () => import('./external-reviewer-details/external-reviewer-details.module')
                    .then(m => m.ExternalReviewerDetailsModule)
            }
        ]
    }];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        SharedModule
    ],
    exports: [RouterModule],
    declarations: [MaintainExternalReviewerComponent],
    providers: [ExtReviewerMaintenanceService]
})
export class MaintainExternalReviewerModule { }
