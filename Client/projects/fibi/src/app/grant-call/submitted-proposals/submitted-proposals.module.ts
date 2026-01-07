import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubmittedProposalsComponent } from './submitted-proposals.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from './directives/filter.pipe';
import { OrderrByPipe } from './directives/orderBy.pipe';
import { SharedComponentModule } from './../../shared-component/shared-component.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: SubmittedProposalsComponent }]),
    SharedModule,
    FormsModule,
    SharedComponentModule  ],
  declarations: [SubmittedProposalsComponent,  OrderrByPipe, FilterPipe]

})
export class SubmittedProposalsModule { }
