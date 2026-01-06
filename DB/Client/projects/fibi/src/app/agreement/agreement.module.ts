import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AgreementRoutingModule } from './agreement-routing.module';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { AgreementViewResolverService } from './agreement-view-resolver.service';
import { AgreementComponent } from './agreement/agreement.component';
import { AgreementService } from './agreement.service';
import { AgreementCommonDataService } from './agreement-common-data.service';
import { AgreementRouteGuardService, CreateAgreementGuard, AdminTabsGuard } from './agreement-route-guard.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { CreateComponent } from './create/create.component';
import { AgreementSharedModule } from './agreement-shared/agreement-shared.module';


@NgModule({
  imports: [
    CommonModule,
    AgreementRoutingModule,
    FormsModule,
    SharedModule,
    AgreementSharedModule
  ],

  providers: [AgreementViewResolverService, AgreementService, AgreementCommonDataService, AgreementRouteGuardService,
     DashboardService,CreateAgreementGuard,AdminTabsGuard],
  declarations: [AgreementComponent, CreateComponent]
})
export class AgreementModule { }
