import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SummaryReportComponent } from './summary-report.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { SummaryReportService } from './summary-report.service'; 
import { SummaryReportViewComponent } from './summary-report-view/summary-report-view.component';


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{path:'',component:SummaryReportComponent}]),
    SharedModule,
    FormsModule
  ],
  declarations: [
    SummaryReportComponent,
    SummaryReportViewComponent
  ],
  providers: [SummaryReportService]
})
export class SummaryReportModule { }
