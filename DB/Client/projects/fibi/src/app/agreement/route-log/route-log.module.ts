import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteLogComponent } from './route-log.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: RouteLogComponent }]),
    SharedModule
  ],
  declarations: [RouteLogComponent]
})
export class RouteLogModule { }
