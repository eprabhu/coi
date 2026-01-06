import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstituteProposalLeadUnitExpandedViewComponent } from './institute-proposal-lead-unit-expanded-view.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

const route: Routes = [
  { path: '', component: InstituteProposalLeadUnitExpandedViewComponent }
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(route),
    SharedModule
  ],
  declarations: [InstituteProposalLeadUnitExpandedViewComponent]
})
export class InstituteProposalLeadUnitExpandedViewModule { }
