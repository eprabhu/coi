import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { MatIconModule } from '@angular/material/icon';
import { SharedComponentModule } from '../shared-components/shared-component.module';
import { AdminDashboardService } from './admin-dashboard.service';
import { FormsModule } from '@angular/forms';
import { DataStoreService } from '../disclosure/services/data-store.service';
import { EntityDetailsModule } from '../disclosure/entity-details/entity-details.module';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { AdminDashboardResolveGuardService } from './admin-dashboard-resolve-gurad-service.service';
import { CoiReviewCommentSliderService } from '../shared-components/coi-review-comments-slider/coi-review-comment-slider.service';
import { ManagementPlanCardComponent } from '../conflict-management-plan/shared/management-plan-card/management-plan-card.component';

const routes: Routes = [
    {
        path: '',
        component: AdminDashboardComponent,
        resolve: { resolvedData: AdminDashboardResolveGuardService },
    }
];

@NgModule({
    declarations: [
        AdminDashboardComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        SharedComponentModule,
        MatIconModule,
        FormsModule,
        SharedModule,
        EntityDetailsModule,
        CKEditorModule,
        ManagementPlanCardComponent
    ],
    providers: [AdminDashboardService, DataStoreService, AdminDashboardResolveGuardService, CoiReviewCommentSliderService]
})
export class AdminDashboardModule {
}
