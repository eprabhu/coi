import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotificationsListComponent } from './notifications-list/notifications-list.component';
import { ModifyNotificationComponent } from './modify-notification/modify-notification.component';
import { ViewNotificationComponent } from './view-notification/view-notification.component';
import { NotificationPromptComponent } from './notification-prompt/notification-prompt.component';

const routes: Routes = [{ path: '', component: NotificationsListComponent},
                        { path: 'modifynotification', component: ModifyNotificationComponent },
                        { path: 'viewnotification', component: ViewNotificationComponent },
                        { path: 'promptnotification', component: NotificationPromptComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotificatioEngineRoutingModule { }
