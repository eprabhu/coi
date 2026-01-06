import {NgModule} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {SharedModule} from "../../shared/shared.module";
import {RouterModule} from "@angular/router";
import { SharedComponentModule } from '../../shared-component/shared-component.module';

import {ProposalHomeComponent} from "./proposal-home.component";
import {ProposalHomeEditComponent} from "./proposal-home-edit/proposal-home-edit.component";
import {ProposalHomeViewComponent} from "./proposal-home-view/proposal-home-view.component";
import { ProposalHomeService } from './proposal-home.service';
import { KeyPerformanceIndicatorProposalService } from './proposal-home-edit/key-performance-indicator-proposal/key-performance-indicator-proposal.service';
import { ProposalDetailsComponent } from './proposal-home-edit/proposal-details/proposal-details.component';
import { AreaOfResearchDetailsComponent } from './proposal-home-edit/area-of-research/area-of-research.component';
import { ProjectTeamComponent } from './proposal-home-edit/project-team/project-team.component';
import { KeyPersonComponent } from './proposal-home-edit/key-person/key-person.component';
import { SpecialReviewDetailsComponent } from './proposal-home-edit/special-review/special-review.component';
import { OrganizationComponent } from './proposal-home-edit/organization/organization.component';
import { ProposalSharedModule } from '../proposal-shared/proposal-shared.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: "",
        component: ProposalHomeComponent
      }
    ]),
    SharedModule,
    FormsModule,
	  ProposalSharedModule,
    SharedComponentModule
  ],
  declarations: [
    ProposalHomeComponent,
    ProposalHomeEditComponent,
    ProposalHomeViewComponent,
    ProposalDetailsComponent,
    SpecialReviewDetailsComponent,
    AreaOfResearchDetailsComponent,
    OrganizationComponent,
    ProjectTeamComponent,
    KeyPersonComponent
  ],
  providers: [
	  ProposalHomeService,
    KeyPerformanceIndicatorProposalService,
  ]
})
export class ProposalHomeModule {}
