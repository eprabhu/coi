import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppRouterComponent } from "./common/app-router/app-router.component";
import { DashboardGuardService, EngMigDashboardGuardService } from './common/services/dashboard-guard.service';
import { AdminRouteGuardService } from './common/services/guards/admin-route-guard.service';
import { LoginGuard, LogoutGuard } from './common/services/guards/login-guard.service';
import { MigratedEngActivateRouteGuardService } from './migrated-engagements/migrated-eng-activate-route-guard.service';

const routes: Routes = [
    {
        path: '', redirectTo: 'coi', pathMatch: 'full'
    },
    {
        path: 'coi', component: AppRouterComponent, canActivate: [DashboardGuardService], canActivateChild: [EngMigDashboardGuardService], children: [
            { path: '', redirectTo: 'user-dashboard', pathMatch: 'full' },
            {
                path: 'disclosure',
                loadChildren: () => import('./disclosure/disclosure.module').then(m => m.DisclosureModule)
            },
            {
                path: 'create-disclosure',
                loadChildren: () => import('./disclosure/disclosure.module').then(m => m.DisclosureModule)
            },
            {
                path: 'user-dashboard',
                loadChildren: () => import('./user-dashboard/user-dashboard.module').then(m => m.UserDashboardModule)
            },
            {
                path: 'admin-dashboard',
                loadChildren: () => import('./admin-dashboard/admin-dashboard.module').then(m => m.AdminDashboardModule),
                canActivate: [AdminRouteGuardService]
            },
            {
                path: 'entity-dashboard',
                loadChildren: () => import('./entity-dashboard/entity-dashboard.module').then(m => m.EntityDashboardModule),
                canActivate: [AdminRouteGuardService]
            },
            {
                path: 'project-dashboard',
                loadChildren: () => import('./project-dashboard/project-dashboard.module').then(m => m.ProjectDashboardModule),
                canActivate: [AdminRouteGuardService]
            },
            {
                path: 'entity-details', loadChildren: () => import('../app/disclosure/entity-details/entity-details.module').then(m => m.EntityDetailsModule)
            },
            {
                path: 'expanded-widgets',
                loadChildren: () => import('./common/header/expanded-widgets/expanded-action-list/expanded-widgets.module').then(m => m.ExpandedActionListModule)
            },
            {
                path: 'user',
                loadChildren: () => import('./user/user.module').then(m => m.UserModule)
            },
            {
                path: 'create-travel-disclosure',
                loadChildren: () => import('./travel-disclosure/travel-disclosure.module').then(m => m.TravelDisclosureModule)
            },
            {
                path: 'travel-disclosure',
                loadChildren: () => import('./travel-disclosure/travel-disclosure.module').then(m => m.TravelDisclosureModule)
            },
            {
                path: 'error-handler',
                loadChildren: () => import('./error-handler/error-handler.module').then(m => m.ErrorHandlerModule)
            },
            {
                path: 'configuration',
                loadChildren: () => import('./configuration/configuration.module').then(m => m.ConfigurationModule),
                canActivate: [AdminRouteGuardService]
            },
            {
                path: 'create-sfi',
                loadChildren: () => import('./add-sfi/add-sfi.module').then(m => m.AddSfiModule)
            },
            {
                path: 'opa',
                loadChildren: () => import('./opa/opa.module').then(m => m.OpaModule)
            },
            {
                path: 'consulting',
                loadChildren: () => import('./consulting-form/consulting-form.module').then(m => m.ConsultingFormModule)
            },
            {
                path: 'opa-dashboard',
                loadChildren: () => import('./opa-dashboard/opa-dashboard.module').then(m => m.OpaDashboardModule),
                canActivate: [AdminRouteGuardService]
            },
            {
                path: 'form-builder-create',
                loadChildren: () => import('./configuration/form-builder-create/form-builder-create.module').then(m => m.FormBuilderCreateModule)
            },
            {
                path: 'manage-entity',
                loadChildren: () => import('./entity-management-module/entity-management-module.module').then(m => m.EntityManagementModuleModule),

            },
            {
                path: 'migrated-engagements',
                loadChildren: () => import('./migrated-engagements/migrated-engagements.module').then(m => m.MigratedEngagementsModule),
                canActivate: [MigratedEngActivateRouteGuardService]
            },
            {
                path: 'declaration-dashboard',
                loadChildren: () => import('./declarations/declaration-admin-dashboard/declaration-admin-dashboard.module').then(m => m.DeclarationAdminDashboardModule),
                canActivate: [AdminRouteGuardService]
            },
            {
                path: 'declaration',
                loadChildren: () => import('./declarations/user-declaration/user-declaration.module').then(m => m.UserCertificationModule)
            },
            {
                path: 'reviewer-dashboard',
                loadChildren: () => import('./reviewer-dashboard/reviewer-dashboard-module').then(m => m.ReviewerDashboardModule)
            },
            {
                path: 'management-plan',
                loadChildren: () => import('./conflict-management-plan/management-plan/management-plan.module').then(m => m.ManagementPlanModule)
            },
            {
                path: 'create-management-plan',
                loadComponent: () => import('./conflict-management-plan/shared/management-plan-creation/management-plan-creation.component').then(m => m.ManagementPlanCreationComponent),
            }
        ]
    },
    { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginModule), canActivate: [LoginGuard] },
    { path: 'error-handler', loadChildren: () => import('./error-handler/error-handler.module').then(m => m.ErrorHandlerModule)},
    { path: 'logout', loadChildren: () => import('./logout/logout.module').then(m => m.LogoutModule), canActivate: [LogoutGuard]}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
