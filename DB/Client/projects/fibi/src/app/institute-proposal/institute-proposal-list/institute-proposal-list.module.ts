import { FormsModule } from '@angular/forms';
import { SharedModule } from './../../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstituteProposalListComponent } from './institute-proposal-list.component';
import {RouterModule, Routes} from '@angular/router';
import { InstituteProposalListService } from './institute-proposal-list.service';

const routes: Routes = [
  {path: '', component: InstituteProposalListComponent}
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [InstituteProposalListComponent],
  providers: [InstituteProposalListService]
})
export class InstituteProposalListModule { }
