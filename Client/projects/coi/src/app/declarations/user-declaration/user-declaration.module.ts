import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { UserCertificationComponent } from './user-declaration.component';
import { FormsModule } from '@angular/forms';
import { SharedComponentModule } from '../../shared-components/shared-component.module';
import { SharedModule } from '../../shared/shared.module';
import { UserDeclarationDataStoreService } from './services/user-declaration-data-store.service';
import { UserDeclarationRouteGuardService } from './services/user-declaration-route-guard.service';
import { UserDeclarationService } from './services/user-declaration.service';
import { FormValidatorModule } from '../../configuration/form-builder-create/shared/form-validator/form-validator.module';
import { UserCertificationNavComponent } from './shared/user-declaration-nav/user-declaration-nav.component';
import { UserCertificationHeaderComponent } from './shared/user-declaration-header/user-declaration-header.component';

const ROUTES: Routes = [{
    path: '', component: UserCertificationComponent, canActivate: [UserDeclarationRouteGuardService],
    children: [
        {
            path: '', redirectTo: 'form', pathMatch: 'full'
        },
        {
            path: 'form', canDeactivate: [UserDeclarationRouteGuardService],
            loadComponent: () => import('./modules/user-declaration-form/user-declaration-form.component').then(m => m.UserCertificationFormComponent),
        },
        {
            path: 'history',
            loadComponent: () => import('./modules/user-declaration-history/user-declaration-history.component').then(m => m.UserCertificationHistoryComponent),
        }
    ]
}];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        FormValidatorModule,
        SharedComponentModule,
        UserCertificationNavComponent,
        UserCertificationHeaderComponent,
        RouterModule.forChild(ROUTES),
    ],
    providers: [
        UserDeclarationService,
        UserDeclarationDataStoreService,
        UserDeclarationRouteGuardService
    ],
    declarations: [UserCertificationComponent]

})
export class UserCertificationModule {}
