import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { SharedComponentModule } from '../../shared-components/shared-component.module';
import { DeclarationAdminDashboardComponent } from './declaration-admin-dashboard.component';
import { DeclarationAdminDashboardService } from './services/declaration-admin-dashboard.service';
import { DeclarationAdminDashboardResolveService } from './services/declaration-admin-dashboard-resolve.service';

const ROUTES: Routes = [{ path: '', component: DeclarationAdminDashboardComponent, resolve: { resolvedData: DeclarationAdminDashboardResolveService } }];

@NgModule({
    declarations: [
        DeclarationAdminDashboardComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(ROUTES),
        SharedComponentModule,
        SharedModule,
    ],
    providers: [
        DeclarationAdminDashboardResolveService,
        DeclarationAdminDashboardService
    ]
})
export class DeclarationAdminDashboardModule {}
