import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FeedMaintenanceRoutingModule } from './feed-maintenance-routing.module';
import { FeedMaintenanceComponent } from './feed-maintenance.component';


@NgModule({
  declarations: [FeedMaintenanceComponent],
  imports: [
    CommonModule,
    FeedMaintenanceRoutingModule
  ]
})
export class FeedMaintenanceModule { }
