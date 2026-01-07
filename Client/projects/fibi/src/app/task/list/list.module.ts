import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskListComponent } from './list.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { OrderrByPipe } from './directives/orderBy.pipe';
import { ListserviceService } from './listservice.service';


@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: TaskListComponent }]),
  ],
  declarations: [TaskListComponent,
      OrderrByPipe],
      providers: [ListserviceService]
})
export class TaskListModule { }
