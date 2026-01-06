import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressReportRoutelogComponent } from './progress-report-routelog.component';
import {RouterModule, Routes} from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  {path: '', component: ProgressReportRoutelogComponent}
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes),
  ],
  declarations: [ProgressReportRoutelogComponent]
})
export class ProgressReportRoutelogModule { }
