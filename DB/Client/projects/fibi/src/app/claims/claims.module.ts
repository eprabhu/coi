import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ClaimsComponent} from './claims.component';
import {FormsModule} from '@angular/forms';
import {ClaimsRoutingModule} from './claims-routing.module';
import {RouterModule} from '@angular/router';
import {AttachmentsComponent} from './attachments/attachments.component';
import {SharedModule} from '../shared/shared.module';
import {ClaimsService} from './services/claims.service';
import {CommonDataService} from './services/common-data.service';
import {WafAttachmentService} from '../common/services/waf-attachment.service';
import {ClaimRouteGuardService} from './services/claim-route-guard.service';
import {ClaimResolverGuardService} from './services/claim-resolver-guard.service';
import { OrderByPipe } from '../shared/directives/orderBy.pipe';


@NgModule({
    declarations: [ClaimsComponent, AttachmentsComponent],
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        ClaimsRoutingModule,
        RouterModule
    ],
    providers: [ClaimsService, CommonDataService, WafAttachmentService, ClaimRouteGuardService, ClaimResolverGuardService, OrderByPipe]
})
export class ClaimsModule {
}
