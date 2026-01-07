import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SponsorReportComponent } from './sponsor-report.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { SponsorReportService } from './sponsor-report.service';
import { AddReportConfigurationComponent } from './addReportConfiguration/addReportConfiguration.component';

const routes: Routes = [{ path: '', component: SponsorReportComponent}];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    FormsModule
  ],
  providers: [SponsorReportService],
  declarations: [SponsorReportComponent, AddReportConfigurationComponent]
})
export class SponsorReportModule { }
