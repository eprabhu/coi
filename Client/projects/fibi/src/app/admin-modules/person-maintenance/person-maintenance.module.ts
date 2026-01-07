import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PersonMaintenanceComponent } from './person-maintenance.component';
import { PersonMaintenanceService } from './person-maintenance.service';
import { SharedModule } from '../../shared/shared.module';
import { PersonRoutingModule } from './person.routing.module';
import { DegreeComponent } from './degree/degree.component';
import { DegreeModule } from './degree/degree.module';
import { PersonMaintenanceGuardService } from './person-maintenance-guard.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    PersonRoutingModule,
    DegreeModule
  ],
  declarations: [PersonMaintenanceComponent],
  providers: [PersonMaintenanceService, PersonMaintenanceGuardService]
})
export class PersonMaintenanceModule { }
