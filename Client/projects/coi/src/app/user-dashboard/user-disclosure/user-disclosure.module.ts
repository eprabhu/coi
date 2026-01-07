import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {UserDisclosureService} from './user-disclosure.service';
import {SharedComponentModule} from '../../shared-components/shared-component.module';
import {FormsModule} from '@angular/forms';
import {SharedModule} from '../../shared/shared.module';
import {UserDisclosureComponent} from './user-disclosure.component';
import {EntityDetailsModule} from '../../disclosure/entity-details/entity-details.module';
import {ResolverGuardService} from './resolver-guard.service';
import { CoiReviewCommentSliderService } from '../../shared-components/coi-review-comments-slider/coi-review-comment-slider.service';
import { ManagementPlanCardComponent } from '../../conflict-management-plan/shared/management-plan-card/management-plan-card.component';

const routes: Routes = [{path: '', component: UserDisclosureComponent, canActivate: [ResolverGuardService]}];

@NgModule({
    declarations: [
        UserDisclosureComponent
    ],
    providers: [UserDisclosureService, ResolverGuardService, CoiReviewCommentSliderService],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        MatIconModule,
        SharedModule,
        SharedComponentModule,
        FormsModule,
        EntityDetailsModule,
        ManagementPlanCardComponent
    ]
})
export class UserDisclosureModule {
}
