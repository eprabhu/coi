import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskDetailsComponent } from './details.component';
import { RouterModule } from '@angular/router';
import { TaskCommentsComponent } from './task-comments/task-comments.component';
import { TaskHistoryComponent } from './task-history/task-history.component';
import { TaskOverviewComponent } from './task-overview/task-overview.component';
import { TaskRouteLogComponent } from './task-route-log/task-route-log.component';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { DetailsService } from './details.service';

const routes = [{
  path: '', component: TaskDetailsComponent,
  children: [
    { path: 'comments', component: TaskCommentsComponent },
    { path: 'route-log', component: TaskRouteLogComponent },
    { path: 'history', component: TaskHistoryComponent }
  ]
}];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    SharedModule
  ],
  declarations: [
    TaskDetailsComponent,
    TaskCommentsComponent,
    TaskHistoryComponent,
    TaskOverviewComponent,
    TaskRouteLogComponent
  ],
  providers: [DetailsService]
})
export class TaskDetailsModule { }
