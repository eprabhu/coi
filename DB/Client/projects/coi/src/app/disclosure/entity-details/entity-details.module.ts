import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntityDetailsComponent } from './entity-details.component';
import { RouterModule, Routes } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from '../../shared/shared.module';
import { EntityQuestionnaireComponent } from './entity-questionnaire/entity-questionnaire.component';
import { EntityDetailsService } from './entity-details.service';
import { FormsModule } from '@angular/forms';
import { SharedComponentModule } from '../../shared-components/shared-component.module';
import { ViewRelationshipDetailsComponent } from './view-relationship-details/view-relationship-details.component';
import { EntityDetailsRouteGuardService } from './entity-details-route-guard.service';
import { SfiHistoryComponent } from './sfi-history/sfi-history.component';
import { MatrixFormComponent } from './matrix-form/matrix-form.component';
import { EngagementAdditionalFormComponent } from './engagement-additional-form/engagement-additional-form.component';
import { FormSharedModule } from '../../configuration/form-builder-create/shared/shared.module';
import { RelatedTravelDisclosuresComponent } from './related-travel-disclosures/related-travel-disclosures.component';
import { RelatedDisclosuresEngagementCardComponent } from './related-travel-disclosures/related-disclosures-engagement-card/related-disclosures-engagement-card.component';
import { MigratedEngagementsService } from '../../migrated-engagements/migrated-engagements.service';
import { ViewEngRelationshipSliderComponent } from '../../migrated-engagements/view-eng-relationship-slider/view-eng-relationship-slider.component';

const routes: Routes = [{ path: 'entity', component:EntityDetailsComponent, canDeactivate: [EntityDetailsRouteGuardService], resolve: {moduleConfig: EntityDetailsRouteGuardService} }]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatIconModule,
    SharedModule,
    FormsModule,
    SharedComponentModule,
    FormSharedModule,
    ViewEngRelationshipSliderComponent
  ],
  declarations: [
    EntityDetailsComponent,
    EntityQuestionnaireComponent,
    ViewRelationshipDetailsComponent,
    SfiHistoryComponent,
    MatrixFormComponent,
    EngagementAdditionalFormComponent,
    RelatedTravelDisclosuresComponent,
    RelatedDisclosuresEngagementCardComponent
  ],
  providers:[
    EntityDetailsService,
    EntityDetailsRouteGuardService,
    MigratedEngagementsService
    ],
  exports : [EntityDetailsComponent, RelatedDisclosuresEngagementCardComponent]
})
export class EntityDetailsModule { }
