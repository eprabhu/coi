import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResearchSummaryExpandedViewComponent } from './research-summary-expanded-view.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  { path: '', component: ResearchSummaryExpandedViewComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule
  ],
  declarations: [ResearchSummaryExpandedViewComponent]
})
export class ResearchSummaryExpandedViewModule { }
