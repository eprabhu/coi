import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InprogressProposalExpanedViewComponent } from './inprogress-proposal-expaned-view.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  { path: '', component: InprogressProposalExpanedViewComponent }
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [InprogressProposalExpanedViewComponent]
})
export class InprogressProposalExpanedViewModule { }
