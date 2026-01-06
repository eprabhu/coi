import { AgreementViewResolverService } from './agreement-view-resolver.service';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AgreementComponent } from './agreement/agreement.component';
import { AgreementRouteGuardService, CreateAgreementGuard, AdminTabsGuard } from './agreement-route-guard.service';
import { CreateComponent } from './create/create.component';

const routes: Routes = [
  { path: '', component: AgreementComponent,
    children: [
      {path: 'create' , component: CreateComponent},
      {path: 'form', loadChildren: () => import('../agreement/agreement-form/agreement-form.module').then(m => m.AgreementFormModule),
      canActivate: [CreateAgreementGuard],canDeactivate: [AgreementRouteGuardService]},
      {path: 'negotiation', loadChildren: () => import('../agreement/negotiation/negotiation.module').then(m => m.NegotiationModule),
      canActivate: [AgreementRouteGuardService, AdminTabsGuard], canDeactivate: [AgreementRouteGuardService]},
      {path: 'route-log', loadChildren: () => import('../agreement/route-log/route-log.module').then(m => m.RouteLogModule) ,
      canActivate: [AgreementRouteGuardService], canDeactivate: [AgreementRouteGuardService]},
      {path: 'history', loadChildren: () => import('../agreement/history/history.module').then(m => m.HistoryModule),
      canActivate: [AgreementRouteGuardService], canDeactivate: [AgreementRouteGuardService]},
      {path: 'attachments', loadChildren: () => import('../agreement/attachments/attachments.module').then(m => m.AttachmentsModule),
      canActivate: [AgreementRouteGuardService], canDeactivate: [AgreementRouteGuardService]},
      {path: 'support', loadChildren: () => import('../agreement/agreement-support/agreement-support.module').then(m => m.AgreementSupportModule),
      canActivate: [AgreementRouteGuardService], canDeactivate: [AgreementRouteGuardService]},
    ],
    resolve: { agreementDetails: AgreementViewResolverService }
  }];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgreementRoutingModule { }
