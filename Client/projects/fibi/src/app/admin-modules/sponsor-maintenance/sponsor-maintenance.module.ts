import { SponsorMaintenanceService } from './sponsor-maintenance.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SponsorMaintenanceComponent } from './sponsor-maintenance.component';
import { SharedModule } from '../../shared/shared.module';
import { SponsorMaintenanceRoutingModule } from './sponsor-maintenance-routing.module';
@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    SponsorMaintenanceRoutingModule,
  ],
  declarations: [SponsorMaintenanceComponent],
  providers: [SponsorMaintenanceService]

})
export class SponsorMaintenanceModule { }
