import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TermsApprovalComponent } from './terms-approval.component';
import { SponsorTermsComponent } from './sponsor-terms/sponsor-terms.component';
import { SpecialApprovalComponent } from './special-approval/special-approval.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { SponsorTermsEditComponent } from './sponsor-terms/sponsor-terms-edit/sponsor-terms-edit.component';
import { SponsorTermsViewComponent } from './sponsor-terms/sponsor-terms-view/sponsor-terms-view.component';
import { SpecialApprovalEditComponent } from './special-approval/special-approval-edit/special-approval-edit.component';
import { SpecialApprovalViewComponent } from './special-approval/special-approval-view/special-approval-view.component';
import { SponsorTermsService } from './sponsor-terms/sponsor-terms.service';
import { SpecialApprovalService } from './special-approval/special-approval.service';
import { RouteGuardService } from './route-guard.service';

const routes: Routes = [{
  path: '', component: TermsApprovalComponent,
  children: [
    { path: '', redirectTo: 'terms', pathMatch: 'full' },
    { path: 'terms', component: SponsorTermsComponent, canActivate: [RouteGuardService] },
    { path: 'approval', component: SpecialApprovalComponent, canActivate: [RouteGuardService] },
    {
      path: '**', loadChildren: () => import('../../error-handler/not-found/not-found.module').then(m => m.NotFoundModule),
    }
  ]
}];
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    FormsModule
  ],
  declarations: [TermsApprovalComponent, SponsorTermsComponent, SponsorTermsEditComponent,
                 SponsorTermsViewComponent, SpecialApprovalComponent, SpecialApprovalEditComponent,
                 SpecialApprovalViewComponent ],
  providers: [SpecialApprovalService, SponsorTermsService, RouteGuardService]
})
export class TermsApprovalModule { }
