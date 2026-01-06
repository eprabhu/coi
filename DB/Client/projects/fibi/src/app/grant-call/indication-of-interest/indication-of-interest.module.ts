import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IndicationOfInterestComponent } from './indication-of-interest.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { IndicationOfInterestService } from './indication-of-interest.service';
import { IoiListComponent } from './ioi-list/ioi-list.component';
import { IoiQuestionnaireComponent } from './ioi-questionnaire/ioi-questionnaire.component';
import { IoiEditComponent } from './ioi-edit/ioi-edit.component';
import { IoiViewComponent } from './ioi-view/ioi-view.component';
import { RouteGuardService } from './route-guard.service';

const routes: Routes = [{
  path: '', component: IndicationOfInterestComponent, canActivate: [RouteGuardService],
  children: [
    { path: '', redirectTo: 'list', pathMatch: 'full' },
    { path: 'questionnaire', component: IoiQuestionnaireComponent },
    { path: 'list', component: IoiListComponent },
    { path: 'edit', component: IoiEditComponent },
    { path: 'view', component: IoiViewComponent },
  ]
},  {
    path: '**',
    loadChildren: () => import('../../error-handler/not-found/not-found.module').then(m => m.NotFoundModule),
}];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    FormsModule,
  ],
  declarations: [IndicationOfInterestComponent, IoiListComponent, IoiQuestionnaireComponent,
                 IoiEditComponent, IoiViewComponent],
  providers: [IndicationOfInterestService, RouteGuardService]
})
export class IndicationOfInterestModule { }
