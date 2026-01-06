import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { RouteGuardService } from './route-guard.service';
// import { TaskComponent } from './task.component';
// import { AwardDataResolverService } from './services/award-data-resolver.service';
// import { AwardRouteGuardService } from './services/award-route-guard.service';

const routes: Routes = [
    {path: '', redirectTo: 'list', pathMatch: 'full'},
    {
        path: 'list',
        loadChildren: () => import('../task/list/list.module').then(m => m.TaskListModule),
        canActivate: [RouteGuardService]
    },
    {
        path: 'details',
        loadChildren: () => import('../task/details/details.module').then(m => m.TaskDetailsModule),
        canActivate: [RouteGuardService]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TaskRoutingModule {
}
