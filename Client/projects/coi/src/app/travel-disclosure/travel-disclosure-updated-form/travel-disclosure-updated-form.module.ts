import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TravelDisclosureUpdatedFormComponent } from './travel-disclosure-updated-form.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedComponentModule } from '../../shared-components/shared-component.module';
import { SharedModule } from '../../shared/shared.module';
import { AddSfiModule } from '../../add-sfi/add-sfi.module';
import { TravelDataFormResolveService } from './services/travel-data-updated-form-resolve.service';
import { FormSharedModule } from '../../configuration/form-builder-create/shared/shared.module';
import { EntityDetailsModule } from '../../disclosure/entity-details/entity-details.module';
import { TravelRouteGuardService } from './../services/travel-route-guard.service';

const routes: Routes = [
    {
        path: '', component: TravelDisclosureUpdatedFormComponent, canActivate: [TravelRouteGuardService], canDeactivate: [],
        children: [ {path: '', redirectTo: 'form', pathMatch: 'full'},
            {
                path: 'form',
                canDeactivate: [TravelRouteGuardService],
                loadChildren: () => import('./form/form.module').then(m => m.FormModule)
            },]
    }
];

@NgModule({
    declarations: [
        TravelDisclosureUpdatedFormComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        RouterModule.forChild(routes),
        SharedComponentModule,
        AddSfiModule,
        FormSharedModule,
        EntityDetailsModule
    ],
    providers: [TravelDataFormResolveService, TravelRouteGuardService],
    exports: []
})
export class TravelDisclosureUpdatedFormModule { }
