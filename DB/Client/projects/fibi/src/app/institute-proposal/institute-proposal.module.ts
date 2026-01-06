import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstituteProposalRoutingModule } from './institute-proposal-routing.module';
import { InstituteProposalComponent } from './institute-proposal.component';
import { InstituteProposalService } from './services/institute-proposal.service';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { ProposalHomeService } from '../proposal/proposal-home/proposal-home.service';
import { IpDataResolveGuardService } from './services/ip-data-resolve-guard.service';
import { RouteGuardService } from './services/route-guard.service';
import { DataStoreService } from './services/data-store.service';
import { AttachmentsService } from './attachments/attachments.service';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        InstituteProposalRoutingModule,
        SharedModule
    ],
    declarations: [InstituteProposalComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    providers: [InstituteProposalService, IpDataResolveGuardService, ProposalHomeService, RouteGuardService, DataStoreService,
        AttachmentsService
    ]

})
export class InstituteProposalModule { }
