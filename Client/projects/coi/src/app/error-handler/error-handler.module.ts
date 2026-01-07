import {UnauthorisedComponent} from './unauthorised/unauthorised.component';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ErrorHandlerComponent} from './error-handler.component';
import {RouterModule, Routes} from '@angular/router';
import {ForbiddenComponent} from './forbidden/forbidden.component';
import {UnderMaintenanceComponent} from './under-maintenance/under-maintenance.component';

const routes: Routes = [
    {path: '', redirectTo: '403', pathMatch: 'full'},
    {path: '404', loadChildren: () => import('../error-handler/not-found/not-found.module').then(m => m.NotFoundModule)},
    {path: '403', component: ForbiddenComponent},
    {path: '401', component: UnauthorisedComponent},
    {path: 'maintenance', component: UnderMaintenanceComponent},
];

@NgModule({
    imports: [RouterModule.forChild(routes), CommonModule],
    exports: [RouterModule],
    declarations: [ErrorHandlerComponent, ForbiddenComponent, UnauthorisedComponent, UnderMaintenanceComponent]
})
export class ErrorHandlerModule {
}
