import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProposalBySponsorExpandedViewComponent } from './proposal-by-sponsor-expanded-view.component';

import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  { path: '', component: ProposalBySponsorExpandedViewComponent }
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ProposalBySponsorExpandedViewComponent]
})
export class ProposalBySponsorExpandedViewModule { }
