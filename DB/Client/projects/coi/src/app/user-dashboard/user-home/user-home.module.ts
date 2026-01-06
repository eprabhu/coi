import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserHomeComponent } from './user-home.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedComponentModule } from '../../shared-components/shared-component.module';
import { NotificationActionListComponent } from './notification-action-list/notification-action-list.component';
import { SharedModule } from '../../shared/shared.module';
import { FaqSectionComponent } from './faq-section/faq-section.component';
import { HelpGuideComponent } from './help-guide/help-guide.component';
import { UserHomeService } from './services/user-home.service';
import { UserHomeResolverGuardService } from './services/user-home-resolver-guard.service';
import { ActionListSliderService } from '../../shared-components/action-list-slider/action-list-slider.service';
import { SkeletonLoaderComponent } from '../../shared/skeleton-loader/skeleton-loader.component';

const routes: Routes = [{ path: '', component: UserHomeComponent, canActivate: [UserHomeResolverGuardService] }];

@NgModule({
	declarations: [
		UserHomeComponent,
		NotificationActionListComponent,
		FaqSectionComponent,
		HelpGuideComponent
	],
	providers: [
		UserHomeResolverGuardService,
		UserHomeService,
		ActionListSliderService
	],
	imports: [
		CommonModule,
		RouterModule.forChild(routes),
		SharedComponentModule,
		SharedModule,
		SkeletonLoaderComponent
	]
})
export class UserHomeModule { }
