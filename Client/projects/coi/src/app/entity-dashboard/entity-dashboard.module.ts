import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntityDashboardComponent } from './entity-dashboard.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedLibraryModule } from 'projects/shared/src/public-api';
import { EntityDetailsModule } from '../disclosure/entity-details/entity-details.module';
import { SharedComponentModule } from '../shared-components/shared-component.module';
import { SharedModule } from '../shared/shared.module';
import { EntityDashboardService } from './entity-dashboard.service';
import { EntityBatchAuthGuard } from './entity-batch/services/entity-batch-auth-guard.service';
import { EntityBatchService } from './entity-batch/services/entity-batch.service';
import { EntityDashboardResolveService } from './entity-dashboard-resolve.service';

const routes: Routes = [
  { path: '', component: EntityDashboardComponent,  resolve: { entitySectionConfig: EntityDashboardResolveService }},
  { path: 'batch', loadChildren: () => import('./entity-batch/entity-batch.module').then(m => m.EntityBatchModule), canActivate: [EntityBatchAuthGuard] }
];

@NgModule({
  declarations: [
    EntityDashboardComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    FormsModule,
    SharedComponentModule,
    EntityDetailsModule,
    SharedLibraryModule
  ],
  providers: [EntityDashboardService, EntityBatchAuthGuard, EntityBatchService, EntityDashboardResolveService]
})
export class EntityDashboardModule { }
