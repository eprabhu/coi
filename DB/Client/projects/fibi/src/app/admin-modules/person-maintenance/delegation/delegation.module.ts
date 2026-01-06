import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DelegationComponent } from './delegation.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild([{ path: '', component: DelegationComponent }]),
  ],
  declarations: [DelegationComponent],
  exports: [DelegationComponent]
})
export class DelegationModule { }
