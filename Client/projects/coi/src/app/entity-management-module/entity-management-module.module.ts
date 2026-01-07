import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntityManagementModuleComponent } from './entity-management-module.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { MatIconModule } from '@angular/material/icon';
import { HeaderDetailsComponent } from './header-details/header-details.component';
import { RightPanelComponent } from './right-panel/right-panel.component';
import { SharedComponentModule } from '../shared-components/shared-component.module';
import { SharedEntityManagementModule } from './shared/shared-entity-management.module';
import { EntityDataStoreService } from './entity-data-store.service';
import { EntityConfigurationResolveGuardService, EntityHistroyLogService, EntityManagementResolveService, EntityNotesSection, EntityPathResolveService, EntityViewCheck } from './entity-management-resolve.service';
import { EntityManagementService } from './entity-management.service';
import { EnitityVerifyModalComponent } from './enitity-verify-modal/enitity-verify-modal.component';
import { EntityStatusChangeComponent } from './entity-status-change/entity-status-change.component';
import { CoiEntityComparisonModule } from './coi-entity-comparison/coi-entity-comparison.module';
import { SkeletonLoaderComponent } from '../shared/skeleton-loader/skeleton-loader.component';

const routes: Routes = [
    {
        path: '', component: EntityManagementModuleComponent, canActivate: [EntityManagementResolveService, EntityViewCheck],
        children: [
            { path: '', redirectTo: 'entity-overview', pathMatch: 'full' },
            { path: 'entity-overview', loadChildren: () => import('./entity-overview/entity-overview.module').then(m => m.EntityFormOverviewModule), canDeactivate: [EntityPathResolveService, EntityHistroyLogService] },
            { path: 'entity-sponsor', loadChildren: () => import('./entity-sponsor/entity-sponsor.module').then(m => m.EntitySponsorModule), canDeactivate: [EntityPathResolveService, EntityHistroyLogService] },
            { path: 'entity-subaward', loadChildren: () => import('./entity-subaward/entity-subaward.module').then(m => m.EntitySubawardModule), canDeactivate: [EntityPathResolveService, EntityHistroyLogService] },
            { path: 'entity-compliance', loadChildren: () => import('./entity-compliance/entity-compliance.module').then(m => m.EntityComplianceModule), canDeactivate: [EntityPathResolveService, EntityHistroyLogService] },
            { path: 'entity-notes', loadChildren: () => import('./entity-notes/entity-notes.module').then(m => m.EntityNotesModule), canDeactivate: [EntityHistroyLogService], canActivate: [EntityNotesSection] },
            { path: 'entity-attachments', loadChildren: () => import('./entity-attachment/entity-attachment.module').then(m => m.EntityAttachmentModule), canDeactivate: [EntityHistroyLogService] },
            { path: 'entity-corporate-family', loadChildren: () => import('./entity-corporate-family/entity-corporate-family.module').then(m => m.EntityCorporateFamilyModule), canDeactivate: [EntityHistroyLogService] },
            { path: 'entity-history', loadChildren: () => import('./entity-history/entity-history.module').then(m => m.EntityHistoryModule)},
        ]
    },
    {
        path: 'create-entity', loadComponent: () => import('./create-entity/create-entity.component').then(c => c.CreateEntityComponent), canDeactivate: [EntityConfigurationResolveGuardService],
        resolve: { entityConfig: EntityConfigurationResolveGuardService }
    }
];

@NgModule({
    declarations: [
        EntityManagementModuleComponent,
        EnitityVerifyModalComponent,
        HeaderDetailsComponent,
        RightPanelComponent,
        EntityStatusChangeComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,
        SharedModule,
        MatIconModule,
        SharedComponentModule,
        SharedEntityManagementModule,
        CoiEntityComparisonModule,
        SkeletonLoaderComponent
    ],
    providers: [
        EntityDataStoreService,
        EntityManagementResolveService,
        EntityConfigurationResolveGuardService,
        EntityManagementService,
        EntityPathResolveService,
        EntityHistroyLogService,
        EntityNotesSection,
        EntityViewCheck
    ]
})
export class EntityManagementModuleModule {}
