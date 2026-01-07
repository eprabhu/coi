import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoleMaintainanceComponent } from './role-maintainance.component';
import { RouterModule, Routes,  } from '@angular/router';

const routes: Routes = [{
	path: '', component: RoleMaintainanceComponent,
	children: [
		{ path: '', redirectTo: 'userRolesList', pathMatch: 'full' },
		{
			path: 'rolesList',
			loadChildren: () => import('./roles-list/roles-list.module').then(m => m.RolesListModule),
		},
		{
			path: 'userRolesList',
			loadChildren: () => import('./user-roles-listing/user-roles-listing.module').then(m => m.UserRolesListingModule),
		},
		{
			path: 'userRoleMaintain',
			loadChildren: () => import('./user-role-creation/user-role-creation.module').then(m => m.UserRoleCreationModule),
		}
	]
}];

@NgModule({
	imports: [
		CommonModule,
		RouterModule.forChild(routes)
	],
	exports: [RouterModule]
})
export class RoleMaintenanceRoutingModule { }
