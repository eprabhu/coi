import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RolesListComponent } from './roles-list.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { MaintainRoleComponent } from './maintain-role/maintain-role.component';
import { OrderByPipe } from './directives/orderBy.pipe';
import { RoleListService } from './role-list.service';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {path: '', component: RolesListComponent},
      {path: 'maintain-role', component: MaintainRoleComponent}
    ]),
    SharedModule,
    FormsModule
  ],
  declarations: [RolesListComponent, MaintainRoleComponent, OrderByPipe],
  providers: [RoleListService]
})
export class RolesListModule { }
