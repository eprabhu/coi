import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TravelDisclosureComponent } from './travel-disclosure.component';
import { SharedComponentModule } from '../shared-components/shared-component.module';
import { SharedModule } from '../shared/shared.module';
import { TravelDisclosureService } from './services/travel-disclosure.service';
import { TravelRouteGuardService } from './services/travel-route-guard.service';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { TravelDataStoreService } from './services/travel-data-store.service';
import { CoiService } from '../disclosure/services/coi.service';
import { AddSfiModule } from '../add-sfi/add-sfi.module';
import { PersonRelatedSlidersModule } from '../person-related-sliders/person-related-sliders.module';
import { FormSharedModule } from '../configuration/form-builder-create/shared/shared.module';

const routes: Routes = [
    {
        path: '', component: TravelDisclosureComponent, canActivate: [TravelRouteGuardService], canDeactivate: [],
        children: [
            {
                path: 'engagements', canDeactivate: [TravelRouteGuardService],
                // loadChildren: () => import('../user-dashboard/user-entities/user-entities.module').then(m => m.UserEntitiesModule)
                loadChildren: () => import('./travel-disclosure-engagements/travel-disclosure-engagements.module').then(m => m.TravelDisclosureEngagementsModule)
            },
            {
                path: 'travel-details', canDeactivate: [TravelRouteGuardService],
                loadChildren: () => import('./travel-disclosure-updated-form/travel-disclosure-updated-form.module').then(m => m.TravelDisclosureUpdatedFormModule)
            },
            {
                path: 'certification', canDeactivate: [TravelRouteGuardService],
                loadChildren: () => import('./travel-certification/travel-certification.module').then(m => m.TravelCertificationModule)
            },
            {
                path: 'summary', canDeactivate: [],
                loadChildren: () => import('./travel-summary/travel-summary.module')
                .then(m => m.TravelSummaryModule)
            },
            {
                path: 'related-disclosures', canDeactivate: [],
                loadChildren: () => import('./travel-related-disclosures/travel-related-disclosures.module')
                .then(m => m.TravelRelatedDisclosuresModule)
            },
            {
                path: 'history', canDeactivate: [],
                loadChildren: () => import('./travel-history/travel-history.module')
                .then(m => m.TravelHistoryModule)
            }
        ]
    }
];
@NgModule({
    declarations: [
        TravelDisclosureComponent,
    ],
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        AddSfiModule,
        PersonRelatedSlidersModule,
        RouterModule.forChild(routes),
        SharedComponentModule,
        FormSharedModule
    ],
    providers: [
        TravelDisclosureService,
        TravelRouteGuardService,
        TravelDataStoreService,
        CoiService
    ],
    exports: []
})
export class TravelDisclosureModule {
}
