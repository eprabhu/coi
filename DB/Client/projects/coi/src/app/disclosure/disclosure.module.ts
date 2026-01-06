import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DisclosureComponent} from './disclosure.component';
import {RouterModule, Routes} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {SearchFieldComponent} from './sfi/search-field/search-field.component';
import {ResolveServiceService} from './services/resolve-service.service';
import {RouterGuardService} from './services/router-guard.service';
import {SharedModule} from '../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { SfiModule } from './sfi/sfi.module';
import { SharedComponentModule } from '../shared-components/shared-component.module';
import {DataStoreService} from "./services/data-store.service";
import { SharedDisclosureModule } from './shared-disclosure/shared-disclosure.module';
import { EntityRiskSliderModule } from './entity-risk-slider/entity-risk-slider.module';
import { SfiListComponent } from './sfi-list/sfi-list.component';
import { CoiService } from './services/coi.service';
import { ReviewRouteGuardService } from './services/review-route-guard.service';
import { PersonRelatedSlidersModule } from '../person-related-sliders/person-related-sliders.module';
import { DefineRelationshipService } from './define-relationship/services/define-relationship.service';
import { DefineRelationshipDataStoreService } from './define-relationship/services/define-relationship-data-store.service';
import { DefineRelationsRouterGuard } from './services/define-relation-router-guard.service';
import { AttachmentRouteGuardService } from './services/attachment-route-guard.service';
import { ValidationDockComponent } from './validation-dock/validation-dock.component';
import { AddSfiModule } from '../add-sfi/add-sfi.module';
import { EntityDetailsModule } from './entity-details/entity-details.module';
import { ExtendedProjRelDataStoreService } from './extended-project-relation-summary/services/extended-project-relation-data-store.service';
import { ExtendedProjectRelationService } from './extended-project-relation-summary/services/extended-project-relation.service';
import { RouteLogRouteGuardService } from './services/route-log-route-guard.service';

const routes: Routes = [
    {
        path: '', component: DisclosureComponent, canActivate: [ResolveServiceService], canDeactivate: [ResolveServiceService],
        children: [
            {
                path: 'screening', canDeactivate: [RouterGuardService],
                loadChildren: () => import('./screening-questionnaire/screening-questionnaire.module').then(m => m.ScreeningQuestionnaireModule)
            },
            {
                path: 'sfi', canDeactivate: [RouterGuardService], component: SfiListComponent
            },
            {
                path: 'relationship', canActivate: [DefineRelationsRouterGuard], canDeactivate: [RouterGuardService],
                loadChildren: () => import('./define-relationship/define-relationship.module').then(m => m.DefineRelationshipModule)
            },
            {
                path: 'certification', canActivate: [RouterGuardService], canDeactivate: [RouterGuardService],
                loadChildren: () => import('./certification/certification.module').then(m => m.CertificationModule)
            },
            {
                path: 'summary', canDeactivate: [RouterGuardService],
                loadChildren: () => import('./summary/summary.module').then(m => m.SummaryModule)
            },
            {
                path: 'disclosure-attachment', canActivate: [AttachmentRouteGuardService], canDeactivate: [RouterGuardService], 
                loadChildren: () => import('./attachment/disclosure-attachment.module').then(m => m.DisclosureAttachmentModule)
            },
            {
                path: 'route-log', canActivate: [RouteLogRouteGuardService], canDeactivate: [RouterGuardService],
                loadChildren: () => import('./coi-route-log/coi-route-log.module').then(m => m.CoiRouteLogModule)
            },
            {
                path: 'review', canActivate: [ReviewRouteGuardService], canDeactivate: [RouterGuardService],
                loadChildren: () => import('./review/review.module').then(m => m.ReviewModule)
            },
            {
                path: 'history', canDeactivate: [RouterGuardService],
                loadChildren: () => import('./history/history.module').then(m => m.HistoryModule)
            }
        ]
    }];

@NgModule({
    declarations: [
        DisclosureComponent,
        SearchFieldComponent,
        SfiListComponent,
        ValidationDockComponent
    ],
    providers: [
        DataStoreService,
        ResolveServiceService,
        RouterGuardService,
        ReviewRouteGuardService,
        DefineRelationsRouterGuard,
        CoiService,
        DefineRelationshipService,
        DefineRelationshipDataStoreService,
        AttachmentRouteGuardService,
        ExtendedProjectRelationService,
        ExtendedProjRelDataStoreService,
        RouteLogRouteGuardService
    ],
    exports: [],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        MatIconModule,
        MatButtonModule,
        SharedModule,
        SfiModule,
        FormsModule,
        EntityDetailsModule,
        SharedComponentModule,
        SharedDisclosureModule,
        EntityRiskSliderModule,
        PersonRelatedSlidersModule,
        AddSfiModule
    ]
})
export class DisclosureModule {
}
