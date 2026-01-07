import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ExpandedActionListComponent } from '../../../../../../fibi/src/app/expanded-widgets/expanded-action-list/expanded-action-list.component';
import { UserDashboardComponent } from '../../../user-dashboard/user-dashboard.component';


const routes: Routes = [
  {
    path: 'expanded-widgets', component: ExpandedActionListComponent,
  },
 {
  path: 'user-dashboard', component: UserDashboardComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})

export class ExpandedWidgetsRoutingModule { }
