import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PendingProposalOfSponsorComponent } from './pending-proposal-of-sponsor.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  { path: '', component: PendingProposalOfSponsorComponent }
];
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule
  ],
  declarations: [
    PendingProposalOfSponsorComponent
  ]

})
export class PendingProposalOfSponsorModule { }
