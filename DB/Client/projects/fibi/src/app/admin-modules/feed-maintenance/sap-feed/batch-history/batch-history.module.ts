import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BatchHistoryComponent } from './batch-history.component';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '../../../../shared/shared.module';
import { FormsModule } from '@angular/forms';

const routes: Routes = [{ path: '', component: BatchHistoryComponent }]

@NgModule({
  declarations: [BatchHistoryComponent],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule,
    FormsModule
  ]
})
export class BatchHistoryModule { }
