import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagementPlanComponent } from './management-plan.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { FormValidatorModule } from '../../configuration/form-builder-create/shared/form-validator/form-validator.module';
import { SharedComponentModule } from '../../shared-components/shared-component.module';
import { ManagementPlanHeaderComponent } from './components/management-plan-header/management-plan-header.component';
import { ManagementPlanNavComponent } from './components/management-plan-nav/management-plan-nav.component';
import { ManagementPlanService } from './services/management-plan.service';
import { ManagementPlanDataStoreService } from './services/management-plan-data-store.service';
import { ManagementPlanRouteGuardService } from './services/management-plan-route-guard.service';
import { ManagementPlanHeaderCardComponent } from '../shared/management-plan-header-card/management-plan-header-card.component';
import { ManagementPlanTaskService } from './sub-modules/management-plan-tasks/management-plan-task.service';

const ROUTES: Routes = [
    {
        path: '',
        component: ManagementPlanComponent,
        canActivate: [ManagementPlanRouteGuardService],
        children: [
            {
                path: '', redirectTo: 'form', pathMatch: 'full'
            },
            {
                path: ':CMP_ID/details',
                loadComponent: () =>
                    import('./sub-modules/management-plan-details-form/management-plan-details-form.component')
                        .then(m => m.ManagementPlanDetailsFormComponent),
            },
            {
                path: ':CMP_ID/plans',
                loadComponent: () =>
                    import('./sub-modules/management-plan-builder/management-plan-builder.component')
                        .then(m => m.ManagementPlanBuilderComponent),
            },
            {
                path: ':CMP_ID/tasks',
                loadComponent: () =>
                    import('./sub-modules/management-plan-tasks/management-plan-tasks.component')
                        .then(m => m.ManagementPlanTasksComponent),
            },
            {
                path: ':CMP_ID/reviews',
                loadComponent: () =>
                    import('./sub-modules/management-plan-reviews/management-plan-reviews.component')
                        .then(m => m.ManagementPlanReviewsComponent),
            },
            {
                path: ':CMP_ID/attachments',
                loadComponent: () =>
                    import('./sub-modules/management-plan-attachments/management-plan-attachments.component')
                        .then(m => m.ManagementPlanAttachmentsComponent),
            },
            {
                path: ':CMP_ID/history',
                loadComponent: () =>
                    import('./sub-modules/management-plan-history/management-plan-history.component')
                        .then(m => m.ManagementPlanHistoryComponent),
            }
        ]
    }
];


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        FormValidatorModule,
        SharedComponentModule,
        ManagementPlanNavComponent,
        ManagementPlanHeaderCardComponent,
        ManagementPlanHeaderComponent,
        RouterModule.forChild(ROUTES),
    ],
    declarations: [ManagementPlanComponent],
    providers: [ManagementPlanRouteGuardService, ManagementPlanService, ManagementPlanDataStoreService, ManagementPlanTaskService]
})
export class ManagementPlanModule { }
