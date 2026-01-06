import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { SharedComponentModule } from '../../shared-components/shared-component.module';
import { ExtendedProjectRelationSummaryComponent } from './extended-project-relation-summary.component';
import { ExtendedProjectDetailsCardComponent } from './extended-project-details-card/extended-project-details-card.component';
import { ExtendedProjectSfiConflictComponent } from './extended-project-sfi-conflict/extended-project-sfi-conflict.component';
import { ExtendedProjRelNavigationComponent } from './ext-proj-rel-navigation/ext-proj-rel-navigation.component';
import { SharedDefineRelationshipModule } from '../define-relationship/shared-define-relationship/shared-define-relationship.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        SharedComponentModule,
        SharedDefineRelationshipModule
    ],
    declarations: [
        ExtendedProjectSfiConflictComponent,
        ExtendedProjectDetailsCardComponent,
        ExtendedProjRelNavigationComponent,
        ExtendedProjectRelationSummaryComponent
    ],
    exports: [
        ExtendedProjRelNavigationComponent,
        ExtendedProjectRelationSummaryComponent
    ]

})
export class ExtendedProjectRelationSummaryModule {}
