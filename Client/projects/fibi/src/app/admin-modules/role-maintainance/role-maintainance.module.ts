import { NgModule } from '@angular/core';
import { RoleMaintainanceComponent } from './role-maintainance.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { RoleMaintenanceRoutingModule } from './role-maintenance-routing.module';

@NgModule({
	imports: [
		CommonModule,
		SharedModule,
		FormsModule,
		RoleMaintenanceRoutingModule
	],
	declarations: [RoleMaintainanceComponent]

})
export class RoleMaintainanceModule { }
