import { CurrencyParserService } from './../../common/services/currency-parser.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { ProjectOutcomeComponent } from './project-outcome.component';
import { ProjectOutcomeService } from './project-outcome.service';
import { PersonMaintenanceService } from '../../admin-modules/person-maintenance/person-maintenance.service';
import { OutcomeResolverService } from './outcome-resolver.service';
import { RouteGuardService } from './route-guard.service';


const routes: Routes = [
  {
    path: '', component: ProjectOutcomeComponent, resolve: { outcomesData: OutcomeResolverService },
    children: [
      { path: '', redirectTo: 'associations', pathMatch: 'full' },
      {
        path: 'publications', loadChildren:
          () => import('./publications/publications.module').then(m => m.PublicationsModule),
          canActivate: [RouteGuardService], canDeactivate: [RouteGuardService]
      },
      {
        path: 'orcid', loadChildren:
          () => import('../../admin-modules/person-maintenance/orcid/orcid.module').then(m => m.OrcidModule),
          canActivate: [RouteGuardService], canDeactivate: [RouteGuardService]
      },
      {
        path: 'achievements', loadChildren:
          () => import('./acheivements/acheivements.module').then(m => m.AcheivementsModule),
          canActivate: [RouteGuardService], canDeactivate: [RouteGuardService]
      },
      {
        path: 'associations', loadChildren:
          () => import('./associations/associations.module').then(m => m.AssociationsModule),
          canActivate: [RouteGuardService], canDeactivate: [RouteGuardService]
      },
      {
        path: 'scopus', loadChildren:
          () => import('./scopus/scopus.module').then(m => m.ScopusModule),
          canActivate: [RouteGuardService], canDeactivate: [RouteGuardService]
      },
      {
        path: '**', loadChildren: () => import('../../error-handler/not-found/not-found.module').then(m => m.NotFoundModule),
      }
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    FormsModule
  ],
  declarations: [ProjectOutcomeComponent],
  providers: [ProjectOutcomeService, CurrencyParserService, PersonMaintenanceService, OutcomeResolverService, RouteGuardService],

})
export class ProjectOutcomeModule { }
