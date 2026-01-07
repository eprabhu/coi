import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from "./login/login.component";
import {AppRouterComponent} from "./common/app-router/app-router.component";
import {DashboardGuardService} from "./common/services/dashboard-guard.service";
import {LogoutComponent} from "./logout/logout.component";

const routes: Routes = [
    {path: '', redirectTo: 'home', pathMatch: "full"},
    {path: 'home', component: AppRouterComponent, canActivate: [DashboardGuardService]},
    {path: 'login', component: LoginComponent},
    {path: 'logout', component: LogoutComponent}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    providers: [DashboardGuardService]
})
export class AppRoutingModule {
}
