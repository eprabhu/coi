import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SchedulerInterfacesComponent } from './scheduler-interfaces.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../../../shared/shared.module';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [SchedulerInterfacesComponent],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: SchedulerInterfacesComponent }])
  ]
})
export class SchedulerInterfacesModule { }
