import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainRouterComponent } from './main-router.component';
import { CreateMainComponent } from './create-main/create-main.component';
import { QuestionnaireDataResolverService } from './services/questionnairedata-resolver.service';
import { MaintenanceComponent } from './maintenance/maintenance.component';

const routes: Routes = [
  { path: '', redirectTo: 'questionnaire', pathMatch: 'full'},
  { path: 'questionnaire', component: MainRouterComponent,
    children: [
      { path: '', redirectTo: 'list', pathMatch: 'full'},
      { path: 'list', component: MaintenanceComponent},
      { path: 'create', component: CreateMainComponent,
                        resolve: { Questionnaire: QuestionnaireDataResolverService }
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreateRoutingModule { }
