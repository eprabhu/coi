import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PendingFeedsComponent } from './pending-feeds.component';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '../../../../shared/shared.module';
import { FormsModule } from '@angular/forms';

const routes: Routes = [{ path: '', component: PendingFeedsComponent }]

@NgModule({
  declarations: [PendingFeedsComponent],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule,
    FormsModule
  ]
})
export class PendingFeedsModule { }
