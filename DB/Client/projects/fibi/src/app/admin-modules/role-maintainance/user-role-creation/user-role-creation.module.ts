import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRoleCreationComponent } from './user-role-creation.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { ViewRightsModalModule } from '../view-rights-modal/view-rights-modal.module';

@NgModule({
	imports: [
		CommonModule,
		RouterModule.forChild([{ path: '', component: UserRoleCreationComponent }]),
		SharedModule,
		ViewRightsModalModule,
		FormsModule
	],
	declarations: [UserRoleCreationComponent]
})
export class UserRoleCreationModule { }
