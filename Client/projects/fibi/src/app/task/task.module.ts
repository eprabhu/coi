import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskComponent } from './task.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { TaskRoutingModule } from './task.routing.module';
import { RouteGuardService } from './route-guard.service';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    TaskRoutingModule,
  ],
  declarations: [TaskComponent],
  providers: [RouteGuardService]
})
export class TaskModule { }
