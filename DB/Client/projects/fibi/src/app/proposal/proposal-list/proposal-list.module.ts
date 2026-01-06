import { FormsModule } from '@angular/forms';
import { SharedModule } from './../../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProposalListComponent } from './proposal-list.component';
import {RouterModule, Routes} from '@angular/router';
import { ProposalListService } from './proposal-list.service';

const routes: Routes = [
  {path: '', component: ProposalListComponent}
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ProposalListComponent],
  providers: [ProposalListService]
})
export class ProposalListModule { }
