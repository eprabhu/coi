import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { ExternalReviewerDetailsComponent } from './external-reviewer-details.component';
import { ExternalReviewerDetailsResolverGuardService } from './external-reviewer-details-resolver-guard.service';
import { RouteGuardService } from './router-guard.service';

const routes: Routes = [{
    path: '', component: ExternalReviewerDetailsComponent, canActivate: [ExternalReviewerDetailsResolverGuardService],
    children: [
        {
            path: '', redirectTo: 'overview', pathMatch: 'full'
        },
        {
            path: 'overview',
            loadChildren: () => import('./reviewer-details/reviewer-details.module').then(m => m.ReviewerDetailsModule),
            canDeactivate: [RouteGuardService]
        },
        {
            path: 'additional-details',
            loadChildren: () => import('./additional-details/additional-details.module').then(m => m.AdditionalDetailsModule),
            canDeactivate: [RouteGuardService],
            canActivate: [RouteGuardService]
        },
        {
            path: 'user-access',
            loadChildren: () => import('./user-access/user-access.module').then(m => m.UserAccessModule),
            canDeactivate: [RouteGuardService],
            canActivate: [RouteGuardService]
        },
        {
            path: 'attachments',
            loadChildren: () => import('./external-reviewer-attachment/external-reviewer-attachment.module').then(
                m => m.ExternalReviewerAttachmentModule),
            canDeactivate: [RouteGuardService],
            canActivate: [RouteGuardService]
        },
    ]
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ExternalReviewerDetailsRoutingModule { }
