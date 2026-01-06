import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceRequestComponent } from './service-request.component';
import { ServiceRequestRoutes } from './service-request.routing';
import { ServiceRequestService } from './services/service-request.service';
import { CommonDataService } from './services/common-data.service';
import { ServiceRequestResolveGuardService } from './services/service-request-resolve-guard.service';
import { RouterGuardService } from './services/router-guard.service';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        ServiceRequestRoutes,
        SharedModule,
        FormsModule
    ],
    declarations: [
        ServiceRequestComponent
    ],
    providers: [
        ServiceRequestResolveGuardService,
        ServiceRequestService,
        CommonDataService,
        RouterGuardService
    ]
})
export class ServiceRequestModule { }
