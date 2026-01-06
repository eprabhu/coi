import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewModule } from './review/review.module';
import { SharedModule } from '../shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { SfiModule } from '../disclosure/sfi/sfi.module';
import { HistoryModule } from './history/history.module';
import { ConsultingService } from './services/consulting.service';
import { RouteGuardService } from './services/route-guard.service';
import { ConsultingFormComponent } from './consulting-form.component';
import { ResolveServiceService } from './services/consulting-resolve.service';
import { ReviewRouteGuardService } from './services/review-route-guard.service';
import { SharedComponentModule } from '../shared-components/shared-component.module';
import { ConsultingFormDataStoreService } from './services/consulting-data-store.service';
import { FormSharedModule } from '../configuration/form-builder-create/shared/shared.module';
import { PersonRelatedSlidersModule } from '../person-related-sliders/person-related-sliders.module';

const ROUTES: Routes = [{
    path: '', component: ConsultingFormComponent, canActivate: [ResolveServiceService], children: [
        { path: '', redirectTo: 'form', pathMatch: 'full' },
        {
            path: 'form',
            canDeactivate: [RouteGuardService],
            loadChildren: () => import('./form/form.module').then(m => m.FormModule)
        },
        {
            path: 'review',
            canActivate: [ReviewRouteGuardService],
            loadChildren: () => import('./review/review.module').then(m => m.ReviewModule)
        },
        {
            path: 'history',
            loadChildren: () => import('./history/history.module').then(m => m.HistoryModule)
        }
    ]
}];

@NgModule({
    declarations: [
        ConsultingFormComponent,
    ],
    imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild(ROUTES),
        FormsModule,
        ReviewModule,
        HistoryModule,
        SharedComponentModule,
        PersonRelatedSlidersModule,
        SfiModule,
        FormSharedModule
    ],
    providers: [
        ResolveServiceService,
        ReviewRouteGuardService,
        RouteGuardService,
        ConsultingService,
        ConsultingFormDataStoreService
    ]
})
export class ConsultingFormModule {}
