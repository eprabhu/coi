import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExternalReviewerDetailsComponent } from './external-reviewer-details.component';
import { SharedModule } from '../../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { ExternalReviewerDetailsRoutingModule } from './external-reviewer-details.routing.module';
import { ExternalReviewerDetailsResolverGuardService } from './external-reviewer-details-resolver-guard.service'
import { RouteGuardService } from './router-guard.service';


@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        ExternalReviewerDetailsRoutingModule
    ],
    declarations: [ExternalReviewerDetailsComponent],
    providers: [
        ExternalReviewerDetailsResolverGuardService,
        RouteGuardService
    ]
})
export class ExternalReviewerDetailsModule { }
