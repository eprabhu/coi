import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReimbursementComponent } from './reimbursement.component';
import { SharedModule } from '../../../shared/shared.module';

const routes = [{
    path: '', component: ReimbursementComponent
  }];
  @NgModule({
    imports: [
      CommonModule,
      RouterModule.forChild(routes),
      SharedModule,
      FormsModule
    ],
    declarations: [ReimbursementComponent],
})
export class ReimbursementModule {
}
