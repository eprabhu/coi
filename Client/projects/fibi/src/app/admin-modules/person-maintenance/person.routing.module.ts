import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { PersonMaintenanceComponent } from './person-maintenance.component';
import { DegreeModule } from './degree/degree.module';
import { PersonMaintenanceGuardService } from './person-maintenance-guard.service';

const routes = [{
  path: '', component: PersonMaintenanceComponent,
  children: [
    {
      path: 'person-details', loadChildren: () => import('../../admin-modules/person-maintenance/person-details/person-details.module')
        .then(m => m.PersonDetailsModule)
    },
    {
      path: 'orcid', loadChildren: () => import('../../admin-modules/person-maintenance/orcid/orcid.module').then(m => m.OrcidModule),
      canActivate: [PersonMaintenanceGuardService]
    },
    {
      path: 'delegation', loadChildren: () =>
        import('../../admin-modules/person-maintenance/delegation/delegation.module').then(m => m.DelegationModule),
      canActivate: [PersonMaintenanceGuardService]
    },
    {
      path: 'timesheet', loadChildren: () =>
        import('../../admin-modules/person-maintenance/timesheet/timesheet.module').then(m => m.TimesheetModule),
      canActivate: [PersonMaintenanceGuardService]
    },
    {
      path: 'training', loadChildren: () =>
        import('../../admin-modules/person-maintenance/training/training.module').then(m => m.TrainingModule),
      canActivate: [PersonMaintenanceGuardService]
    },
    {
      path: 'degree', loadChildren: () => import('../../admin-modules/person-maintenance/degree/degree.module').then(m => m.DegreeModule),
      canActivate: [PersonMaintenanceGuardService]
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PersonRoutingModule { }
