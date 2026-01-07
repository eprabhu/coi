import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MigratedEngagementsComponent } from './migrated-engagements.component';
import { RouterModule, Routes } from '@angular/router';
import { MigratedEngagementsService } from './migrated-engagements.service';
import { SharedComponentModule } from '../shared-components/shared-component.module';
import { SharedModule } from '../shared/shared.module';
import { MigratedEngagementsCardComponent } from './migrated-engagements-card/migrated-engagements-card.component';
import { EntityDetailsModule } from '../disclosure/entity-details/entity-details.module';
import { EngagementRelationshipDetailsComponent } from './engagement-relationship-details/engagement-relationship-details.component';
import { MigratedEngagementMatrixComponent } from './migrated-engagement-matrix/migrated-engagement-matrix.component';
import { MigratedEngDeactivateRouteGuardService } from './migrated-eng-deactivate-route-guard.service';
import { MigratedEntityDetailsCardComponent } from './migrated-entity-details-card/migrated-entity-details-card.component';
import { MigratedEngagementDetailsComponent } from './migrated-engagement-details/migrated-engagement-details.component';
import { MigratedEngRouterComponent } from './migrated-eng-router/migrated-eng-router.component';
import { EntityManagementService } from '../entity-management-module/entity-management.service';
import { ViewEngRelationshipSliderComponent } from './view-eng-relationship-slider/view-eng-relationship-slider.component';

const routes: Routes = [
    { path: '', component: MigratedEngRouterComponent, canDeactivate: [MigratedEngDeactivateRouteGuardService], 
        children: [
            { path: '', component: MigratedEngagementsComponent },
            { path: 'engagement-details', component: MigratedEngagementDetailsComponent},
        ]
     },
];

@NgModule({
    declarations: [
        MigratedEngRouterComponent,
        MigratedEngagementsComponent,
        MigratedEngagementsCardComponent,
        MigratedEntityDetailsCardComponent,
        MigratedEngagementDetailsComponent
    ],
    imports: [
        RouterModule.forChild(routes),
        CommonModule,
        SharedModule,
        SharedComponentModule,
        EntityDetailsModule,
        MigratedEngagementMatrixComponent,
        ViewEngRelationshipSliderComponent,
        EngagementRelationshipDetailsComponent
    ],
    providers:[
        MigratedEngagementsService,
        MigratedEngDeactivateRouteGuardService,
        EntityManagementService
    ]
})
export class MigratedEngagementsModule { }
