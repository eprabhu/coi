import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectDashboardComponent } from './project-dashboard.component';
import { ProjectDashboardCardComponent } from './project-dashboard-card/project-dashboard-card.component';
import { ProjectDashboardService } from './project-dashboard.service';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { SharedComponentModule } from '../shared-components/shared-component.module';
import { FormsModule } from '@angular/forms';
import { ProjectOverviewCommentsSliderComponent } from './project-overview-comments-slider/project-overview-comments-slider.component';
import { ProjectOverviewNotificationSliderComponent } from './project-overview-notification-slider/project-overview-notification-slider.component';
import { ProjectMandatoryHistorySliderComponent } from './project-mandatory-history-slider/project-mandatory-history-slider.component';
import { ProjectDashboardResolveGuardService } from './project-dashboard-resolve-gurad-service.service';
import { ProjectDashboardNotificationSentItemsComponent } from './project-dashboard-notification-sent-items/project-dashboard-notification-sent-items.component';

const routes: Routes = [
  {
    path: '', component: ProjectDashboardComponent, resolve: {moduleConfig: ProjectDashboardResolveGuardService}
  }];

@NgModule({
  declarations: [
    ProjectDashboardCardComponent,
    ProjectOverviewCommentsSliderComponent,
    ProjectOverviewNotificationSliderComponent,
    ProjectDashboardComponent,
    ProjectMandatoryHistorySliderComponent,
    ProjectDashboardNotificationSentItemsComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    RouterModule.forChild(routes),
    SharedModule,
    SharedComponentModule,
    FormsModule
  ],
  providers: [ProjectDashboardResolveGuardService ,ProjectDashboardService]
})
export class ProjectDashboardModule { }
