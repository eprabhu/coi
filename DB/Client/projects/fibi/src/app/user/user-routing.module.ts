import { FaqComponent } from './faq/faq.component';
import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { ChangePasswordComponent } from './settings/change-password/change-password.component';
import { SettingsComponent } from './settings/settings.component';
import { AddFaqComponent } from './faq/add-faq/add-faq.component';


const routes: Routes = [
                       {path: 'settings', component: SettingsComponent},
                       {path: 'faq', component: FaqComponent},
                       { path: 'add-faq', component: AddFaqComponent}];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class UserRoutingModule { }

