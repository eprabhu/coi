import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotificationsListComponent } from './notifications-list/notifications-list.component';
import { ModifyNotificationComponent } from './modify-notification/modify-notification.component';
import { FormsModule } from '@angular/forms';
import { NotificationEngineService } from './services/notification-engine.service';
import { NotificatioEngineRoutingModule } from './notification-engine-routing';
import { ViewNotificationComponent } from './view-notification/view-notification.component';
import { NotificationPromptComponent } from './notification-prompt/notification-prompt.component';

import { SharedModule } from '../../shared/shared.module';
import { OrderrByPipe } from './notifications-list/directives/orderBy.pipe';

@NgModule({
  imports: [
    SharedModule,
    FormsModule,
    NotificatioEngineRoutingModule,
    CommonModule,
  ],
  declarations: [
    NotificationsListComponent,
    ModifyNotificationComponent,
    ViewNotificationComponent,
    NotificationPromptComponent,
    OrderrByPipe
  ],
  providers: [
    NotificationEngineService
  ]

})
export class NotificationEngineModule { }
