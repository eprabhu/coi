import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RolodexMaintenanceComponent } from './rolodex-maintenance.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RolodexMaintenanceService } from './rolodex-maintenance.service';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: RolodexMaintenanceComponent}]),
    SharedModule
  ],
  declarations: [RolodexMaintenanceComponent],
  providers: [RolodexMaintenanceService]
})
export class RolodexMaintenanceModule { }
