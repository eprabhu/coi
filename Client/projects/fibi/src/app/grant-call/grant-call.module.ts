import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GrantCallComponent } from './grant-call.component';
import { GrantCallRoutingModule } from './grant-call.routing.module';
import { GrantCallService } from './services/grant.service';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { GrantCommonDataService } from './services/grant-common-data.service';
import { GrantRouteGuardService } from './services/grant-route-guard.service';
import { AwardDataResolveGuardService } from './services/grant-data-resolve-guard.service';

@NgModule({
    imports: [
        CommonModule,
        GrantCallRoutingModule,
        SharedModule,
        FormsModule
    ],
    declarations: [GrantCallComponent],
    providers: [GrantCallService, GrantCommonDataService, GrantRouteGuardService, AwardDataResolveGuardService]
})
export class GrantCallModule {
}
