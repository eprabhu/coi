import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OpaComponent } from './opa.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedComponentModule } from '../shared-components/shared-component.module';
import { FormsModule } from '@angular/forms';
import { ResolveServiceService } from './services/resolve-service.service';
import { DataStoreService } from './services/data-store.service';
import { OpaService } from './services/opa.service';
import { OPASharedModule } from './shared/shared.module';
import { SharedModule } from '../shared/shared.module';
import { PersonRelatedSlidersModule } from '../person-related-sliders/person-related-sliders.module';
import { ReviewRouteGuardService } from './services/review-route-guard.service';
import { RouterGuardService } from './services/router-guard.service';
import { FormSharedModule } from '../configuration/form-builder-create/shared/shared.module';
import { FormBuilderCreateService } from '../configuration/form-builder-create/form-builder-create.service';
import { EntityDetailsModule } from '../disclosure/entity-details/entity-details.module';
import { AddSfiModule } from '../add-sfi/add-sfi.module';

const routes: Routes = [{
    path: '', component: OpaComponent, canActivate: [ResolveServiceService], children: [
        { path: '', redirectTo: 'form', pathMatch: 'full' },
        {
            path: 'form',
            canDeactivate: [RouterGuardService],
            loadChildren: () => import('./form/form.module').then(m => m.FormModule)
        },
        {
            path: 'review',
            canDeactivate: [RouterGuardService],
            canActivate: [ReviewRouteGuardService],
            loadChildren: () => import('./review/review.module').then(m => m.ReviewModule)
        },
        {
            path: 'history',
            canDeactivate: [RouterGuardService],
            loadChildren: () => import('./history/history.module').then(m => m.HistoryModule)
        },
        {
            path: 'route-log',
            canDeactivate: [RouterGuardService],
            loadChildren: () => import('./opa-route-log/opa-route-log.module').then(m => m.OpaRouteLogModule)
        }
    ]
}];

@NgModule({
    declarations: [
        OpaComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        SharedComponentModule,
        SharedModule,
        OPASharedModule,
        PersonRelatedSlidersModule,
        FormSharedModule,
        EntityDetailsModule,
        AddSfiModule,
        RouterModule.forChild(routes),
    ],
    providers: [
        OpaService,
        DataStoreService,
        ResolveServiceService,
        RouterGuardService,
        ReviewRouteGuardService,
        FormBuilderCreateService
    ]
})
export class OpaModule {
}
