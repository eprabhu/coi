import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminDashboardComponent } from './admin-dashboard.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', component: AdminDashboardComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes), CommonModule],
  exports: [RouterModule],
  declarations: [AdminDashboardComponent]
})
export class AdminDashboardModule { }
