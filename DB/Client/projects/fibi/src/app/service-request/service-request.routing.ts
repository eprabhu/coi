import { Routes, RouterModule } from '@angular/router';
import { ServiceRequestComponent } from './service-request.component';
import { RouterGuardService } from './services/router-guard.service';
import { ServiceRequestResolveGuardService } from './services/service-request-resolve-guard.service';

const routes: Routes = [
    {
        path: '', component: ServiceRequestComponent, canActivate: [ServiceRequestResolveGuardService],
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'overview' },
            {
                path: 'overview', loadChildren: () => import('./overview/overview.module').then(m => m.OverviewModule),
                canActivate: [RouterGuardService], canDeactivate: [RouterGuardService]
            },
            {
                path: 'history', loadChildren: () => import('./history/history.module').then(m => m.HistoryModule),
                canActivate: [RouterGuardService], canDeactivate: [RouterGuardService]
            },
            {
                path: 'route-log', loadChildren: () => import('./route-log/route-log.module').then(m => m.RouteLogModule),
                canActivate: [RouterGuardService], canDeactivate: [RouterGuardService]
            },
            {
                path: 'questionnaire', loadChildren: () => import('./questionnaire/questionnaire.module').then(m => m.QuestionnaireModule),
                canActivate: [RouterGuardService], canDeactivate: [RouterGuardService]
            },
            {
                path: 'comments', loadChildren: () => import('./comments-and-attachments/comments-and-attachments.module')
                    .then(m => m.CommentsAndAttachmentsModule),
                canActivate: [RouterGuardService], canDeactivate: [RouterGuardService]
            }
        ]
    }
];

export const ServiceRequestRoutes = RouterModule.forChild(routes);
