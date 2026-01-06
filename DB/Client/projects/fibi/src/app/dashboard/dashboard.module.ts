import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { SharedModule } from '../shared/shared.module';

import { DashboardService } from '../dashboard/dashboard.service';

import { DashboardComponent } from './dashboard.component';
@NgModule({
  imports: [
    CommonModule,
    DashboardRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
  ],
  declarations: [
    DashboardComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    DashboardService,
  ]
})
export class DashboardModule { }
