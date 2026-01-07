import {APP_INITIALIZER, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HashLocationStrategy, LocationStrategy} from "@angular/common";
import {CommonService} from "./common/services/common.service";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {HeaderComponent} from "./common/header/header.component";
import {MatIconModule} from "@angular/material/icon";
import {AppRouterComponent} from "./common/app-router/app-router.component";
import {FooterComponent} from "./common/footer/footer.component";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {AppHttpInterceptor} from './common/services/http-interceptor';
import {DashboardGuardService, EngMigDashboardGuardService} from './common/services/dashboard-guard.service';
import {NavigationService} from './common/services/navigation.service';
import {AdminRouteGuardService} from './common/services/guards/admin-route-guard.service';
import { LeftNavBarComponent } from './common/left-nav-bar/left-nav-bar.component';
import {MatMenuModule} from "@angular/material/menu";
import { SharedComponentModule } from './shared-components/shared-component.module';
import { FormsModule } from '@angular/forms';
import { DragDirective } from './common/header/drag.directive';
import {HeaderService} from "./common/header/header.service";
import { LoginGuard, LogoutGuard } from './common/services/guards/login-guard.service';
import { ElasticConfigService } from './common/services/elastic-config.service';
import { InformationAndHelpTextService } from './common/services/informationAndHelpText.service';
import { SharedModule } from './shared/shared.module';
import { AutoSaveService } from './common/services/auto-save.service';
import { ExpandedActionListService } from './common/header/expanded-widgets/expanded-action-list/expanded-action-list.service';
import { SharedLibraryModule } from 'projects/shared/src/public-api';
import { MigratedEngActivateRouteGuardService } from './migrated-engagements/migrated-eng-activate-route-guard.service';
import { ManagementPlanCreationSliderComponent } from './conflict-management-plan/shared/management-plan-creation-slider/management-plan-creation-slider.component';

export function getappConfiguration(appConfigurationServiceService: CommonService) {
    return () => appConfigurationServiceService.getAppConfig();
}

@NgModule({
    declarations: [
        AppComponent,
        HeaderComponent,
        AppRouterComponent,
        FooterComponent,
        LeftNavBarComponent,
        DragDirective
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        HttpClientModule,
        SharedComponentModule,
        SharedLibraryModule,
        MatIconModule,
        MatMenuModule,
        SharedModule,
        FormsModule,
        ManagementPlanCreationSliderComponent
    ],
    providers: [CommonService,
        HeaderService,
        DashboardGuardService,
        EngMigDashboardGuardService,
        ElasticConfigService,
        {
            provide: APP_INITIALIZER,
            useFactory: getappConfiguration,
            deps: [CommonService],
            multi: true
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AppHttpInterceptor,
            multi: true
        }, {
            provide: LocationStrategy,
            useClass: HashLocationStrategy
        }, NavigationService,
        AdminRouteGuardService,
        LoginGuard,
        LogoutGuard,
        InformationAndHelpTextService,
        AutoSaveService,
        ExpandedActionListService,
        MigratedEngActivateRouteGuardService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {


}
