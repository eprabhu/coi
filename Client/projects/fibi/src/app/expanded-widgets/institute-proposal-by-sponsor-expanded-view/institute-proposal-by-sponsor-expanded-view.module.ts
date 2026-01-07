import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstituteProposalBySponsorExpandedViewComponent } from './institute-proposal-by-sponsor-expanded-view.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

const route: Routes = [{
  path: '', component: InstituteProposalBySponsorExpandedViewComponent
}]
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(route),
    SharedModule
  ],
  declarations: [InstituteProposalBySponsorExpandedViewComponent]
})
export class InstituteProposalBySponsorExpandedViewModule { }
