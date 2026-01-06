import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BatchDetailsComponent } from './batch-details.component';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '../../../../shared/shared.module';
import { FormsModule } from '@angular/forms';

const routes: Routes = [{ path: '', component: BatchDetailsComponent }]

@NgModule({
  declarations: [BatchDetailsComponent],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    SharedModule,
    FormsModule
  ]
})
export class BatchDetailsModule { }
