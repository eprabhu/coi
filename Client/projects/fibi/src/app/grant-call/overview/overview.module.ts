import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverviewComponent } from './overview.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { PointOfContactComponent } from './point-of-contact/point-of-contact.component';
import { GeneralDetailsEditComponent } from './general-details/general-details-edit/general-details-edit.component';
import { AreaOfResearchComponent } from './area-of-research/area-of-research.component';
import { EligibilityCriteriaComponent } from './eligibility-criteria/eligibility-criteria.component';
import { PointOfContactService } from './point-of-contact/point-of-contact.service';
import { AreaOfResearchService } from './area-of-research/area-of-research.service';
import { EligibilityCriteriaService } from './eligibility-criteria/eligibility-criteria.service';
import { GeneralDetailsService } from './general-details/general-details-edit/general-details.service';
import { GeneralDetailsViewComponent } from './general-details/general-details-edit/general-details-view/general-details-view.component';
import { ApplicationsComponent } from './applications/applications.component';
import { SharedComponentModule } from '../../shared-component/shared-component.module';
import { GrantCallSharedModule } from '../grant-call-shared/grant-call-shared.module';

  @NgModule({
    imports: [
      CommonModule,
      RouterModule.forChild([{ path: '', component: OverviewComponent }]),
      SharedModule,
      FormsModule,
      SharedComponentModule,
      GrantCallSharedModule
    ],
  declarations: [OverviewComponent, PointOfContactComponent, GeneralDetailsEditComponent,
                 GeneralDetailsViewComponent, ApplicationsComponent,
                 AreaOfResearchComponent, EligibilityCriteriaComponent],
    providers: [PointOfContactService, AreaOfResearchService, EligibilityCriteriaService, GeneralDetailsService]
})
export class OverviewModule { }
