import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogoutComponent } from './logout.component';
import { RouterModule, Routes } from '@angular/router';

const route: Routes = [{path: '', component: LogoutComponent}];

@NgModule({
  declarations: [
    LogoutComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(route),
  ]
})
export class LogoutModule { }
