import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRolesListingComponent } from './user-roles-listing.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { ViewRightsModalModule } from '../view-rights-modal/view-rights-modal.module';

@NgModule({
	imports: [
		CommonModule,
		RouterModule.forChild([{ path: '', component: UserRolesListingComponent }]),
		SharedModule,
		FormsModule,
		ViewRightsModalModule
	],
	declarations: [UserRolesListingComponent]
})
export class UserRolesListingModule { }
