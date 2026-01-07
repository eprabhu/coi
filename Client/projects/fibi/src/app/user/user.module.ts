import { FaqService } from './faq/faq.service';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRoutingModule } from './user-routing.module';
import { FaqComponent } from './faq/faq.component';

import { NotificationsComponent } from './settings/notifications/notifications.component';
import { ThemesComponent } from './settings/themes/themes.component';
import { ChangePasswordComponent } from './settings/change-password/change-password.component';
import { SettingsComponent } from './settings/settings.component';
import { ChangePasswordService } from './settings/change-password/change-password.service';
import { AddFaqComponent } from './faq/add-faq/add-faq.component';
import { AddFaqService } from './faq/add-faq/add-faq.service';
import { SharedModule } from '../shared/shared.module';
import { UserComponent } from './user.component';
import { NotificationService } from './settings/notifications/notification.service';
import { SettingsServiceService } from './settings/settings-service.service';
import { IntegrationComponent } from './settings/integration/integration.component';


@NgModule({
  imports: [
    CommonModule,
    UserRoutingModule,
    FormsModule,
    SharedModule
  ],
  declarations: [ChangePasswordComponent, FaqComponent,
    SettingsComponent, NotificationsComponent, IntegrationComponent,
    ThemesComponent, AddFaqComponent, UserComponent],
  providers: [ChangePasswordService, SettingsServiceService,  FaqService, AddFaqService, NotificationService],
  exports: [ChangePasswordComponent]
})
export class UserModule { }
