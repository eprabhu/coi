import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ResearchSummaryWidgetsComponent } from './research-summary-widgets.component';

const routes: Routes = [
  { path: '', component: ResearchSummaryWidgetsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class ResearchSummaryWidgetsRoutingModule { }
