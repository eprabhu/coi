import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverviewComponent } from './overview.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { GeneralSectionEditComponent } from './general-section/general-section-edit/general-section-edit.component';
import { GeneralSectionViewComponent } from './general-section/general-section-view/general-section-view.component';
import { OverviewService } from './overview.service';
import { KeyPersonComponent } from './key-person/key-person.component';
import { KeyPersonService } from './key-person/key-person.service';
import { SpecialReviewComponent } from './special-review/special-review.component';
import { SpecialReviewService } from './special-review/special-review.service';
import { AreaOfResearchComponent } from './area-of-research/area-of-research.component';
import { AreaOfResearchService } from './area-of-research/area-of-research.service';
import { SharedComponentModule } from '../../shared-component/shared-component.module';
import { IpSharedModule } from '../ip-shared/ip-shared.module';
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: OverviewComponent }]),
    SharedModule,
    FormsModule,
    SharedComponentModule,
    IpSharedModule

  ],
  declarations: [OverviewComponent,
    GeneralSectionEditComponent, GeneralSectionViewComponent,
    KeyPersonComponent, SpecialReviewComponent, AreaOfResearchComponent
  ],
  providers: [OverviewService, KeyPersonService, SpecialReviewService, AreaOfResearchService]
})
export class OverviewModule { }
