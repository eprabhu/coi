import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddSfiComponent } from './add-sfi.component';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { EntityDataResolveGuardService, SfiDataResolveGuardService } from './services/sfi-data-resolve-guard.service';
import { AddSfiRouteGuardService } from './services/add-sfi-route-guard.service';
import { SharedComponentModule } from '../shared-components/shared-component.module';
import { AddSfiSliderComponent } from './add-sfi-slider/add-sfi-slider.component';
import { AddSfiService } from './services/add-sfi.service';
import { MigratedEngagementsService } from '../migrated-engagements/migrated-engagements.service';
import { EntityDetailsModalService } from '../shared-components/entity-details-modal/entity-details-modal.service';
import { ViewEngRelationshipSliderComponent } from '../migrated-engagements/view-eng-relationship-slider/view-eng-relationship-slider.component';

const routes: Routes = [
    {
        path: 'create', component: AddSfiComponent, canDeactivate: [AddSfiRouteGuardService], resolve: { moduleConfig: SfiDataResolveGuardService, entityConfig: EntityDataResolveGuardService }
    }];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    SharedComponentModule,
    RouterModule.forChild(routes),
    ViewEngRelationshipSliderComponent
  ],
  declarations: [AddSfiComponent, AddSfiSliderComponent],
  exports: [AddSfiComponent, AddSfiSliderComponent],
  providers: [AddSfiService, SfiDataResolveGuardService, EntityDataResolveGuardService, AddSfiRouteGuardService, EntityDetailsModalService, MigratedEngagementsService]
})
export class AddSfiModule { }
