import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoleComponent } from './role.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RoleEditComponent } from './role-edit/role-edit.component';
import { RoleViewComponent } from './role-view/role-view.component';
import { SharedModule } from '../../shared/shared.module';
import { RoleService } from './role.service';
import { PersonRoleResolveGuardService } from './person-role-guard.service';


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: RoleComponent, canActivate: [PersonRoleResolveGuardService]}]),
    FormsModule,
    SharedModule
  ],
  declarations: [RoleComponent, RoleEditComponent, RoleViewComponent],
  providers: [RoleService, PersonRoleResolveGuardService]
})
export class RoleModule { }
