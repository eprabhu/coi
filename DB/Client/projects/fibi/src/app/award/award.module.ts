import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AwardComponent } from './award.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { AwardRoutingModule } from './award.routing.module';
import { CommonDataService } from './services/common-data.service';
import { OverviewService } from './overview/overview.service';
import { AwardService } from './services/award.service';
import { ExpenditureComponent } from './expenditure/expenditure.component';
import { ExpenditureService } from './expenditure/expenditure.service';
import { AwardRouteGuardService } from './services/award-route-guard.service';
import { BudgetService } from './budget-expenses/budget.service';
import { PersonnelService } from './budget-expenses/award-budget/personnel/personnel.service';
import { BudgetDataService } from './budget-expenses/budget-data.service';
import { TaskSideNavBarComponent } from './task-side-nav-bar/task-side-nav-bar.component';
import { TaskSideNavBarService } from './task-side-nav-bar/task-side-nav-bar.service';
import { CommentsService } from './award-comparison/comment/comments.service';
import { CommentModule } from './award-comparison/comment/comment.module';
import { ToolkitEventInteractionService } from './award-comparison/toolkit-event-interaction.service';
import { AwardDataResolveGuardService } from './services/award-data-resolve-guard.service';
import { SharedComponentModule } from '../shared-component/shared-component.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    AwardRoutingModule,
    CommentModule,
    SharedComponentModule
  ],
  declarations: [AwardComponent,
    ExpenditureComponent, TaskSideNavBarComponent
  ],
  providers: [CommonDataService, PersonnelService, AwardDataResolveGuardService,
    OverviewService, AwardService,
    ExpenditureService, TaskSideNavBarService,
    AwardRouteGuardService, BudgetService,
    CommentsService, ToolkitEventInteractionService]
})
export class AwardModule { }
