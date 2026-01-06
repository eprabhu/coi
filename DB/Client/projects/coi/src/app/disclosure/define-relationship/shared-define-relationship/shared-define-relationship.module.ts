import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectDetailsCardComponent } from './project-details-card/project-details-card.component';
import { ProjectSfiConflictComponent } from './project-sfi-conflict/project-sfi-conflict.component';
import { ProjectSfiNavigationComponent } from './project-sfi-navigation/project-sfi-navigation.component';
import { ProjectSfiRelationshipComponent } from './project-sfi-relationship/project-sfi-relationship.component';
import { SharedComponentModule } from '../../../shared-components/shared-component.module';
import { SharedModule } from '../../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { ApplyToAllModalComponent } from './apply-to-all-modal/apply-to-all-modal.component';
import { AddConflictSliderComponent } from './add-conflict-slider/add-conflict-slider.component';
import { EngagementDetailsCardComponent } from './eng-details-card/eng-details-card.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        SharedComponentModule,
    ],
    declarations: [
        ProjectSfiRelationshipComponent,
        ProjectDetailsCardComponent,
        ProjectSfiNavigationComponent,
        ProjectSfiConflictComponent,
        ApplyToAllModalComponent,
        AddConflictSliderComponent,
        EngagementDetailsCardComponent
    ],
    exports: [
        ProjectSfiRelationshipComponent,
        ProjectDetailsCardComponent,
        ProjectSfiNavigationComponent,
        ProjectSfiConflictComponent,
        ApplyToAllModalComponent,
        AddConflictSliderComponent,
        EngagementDetailsCardComponent
    ]
})
export class SharedDefineRelationshipModule { }
