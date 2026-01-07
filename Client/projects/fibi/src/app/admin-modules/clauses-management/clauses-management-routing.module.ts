import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ClausesManagementComponent } from './clauses-management.component';

const routes = [{
  path: '', component: ClausesManagementComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClausesManagementRoutingModule { }
