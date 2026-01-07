import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AwardedProposalBySponsorExpandedViewComponent } from './awarded-proposal-by-sponsor-expanded-view.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([{ path: '', component: AwardedProposalBySponsorExpandedViewComponent}])
  ],
  declarations: [AwardedProposalBySponsorExpandedViewComponent]
})
export class AwardedProposalBySponsorExpandedViewModule { }
