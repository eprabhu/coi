import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, APP_INITIALIZER } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LoginComponent } from './login/login.component';
import { FooterComponent } from './common/footer/footer.component';
import { HeaderComponent } from './common/header/header.component';

import { LoginService } from './login/login.service';
import { DashboardService } from './dashboard/dashboard.service';
import { CommonService } from './common/services/common.service';
import { ResearchSummaryConfigService } from './common/services/research-summary-config.service';

import { AuthGuard, LoginGuard } from './common/services/auth-guard.service';
import { CustomPreloadingStrategy } from './common/services/custom-module-loader';
import { AppHttpInterceptor } from './common/services/http-interceptor';
import { AppRouterComponent } from './common/app-router/app-router.component';
import { LogoutComponent } from './logout/logout.component';
import { ElasticConfigService } from './common/services/elastic-config.service';
import { NavigationService } from './common/services/navigation.service';
import { AutoSaveService } from './common/services/auto-save.service';
import { DashboardGuardService } from './common/services/dashboard-guard.service';
import { WebSocketService } from './common/services/web-socket.service';
import { ChatboxComponent } from './common/chatbox/chatbox.component';

export function getappConfiguration(appConfigurationServiceService: CommonService) {
    return () => appConfigurationServiceService.getAppConfig();
}

@NgModule({
    declarations: [
        AppRouterComponent,
        HeaderComponent,
        FooterComponent,
        AppComponent,
        LoginComponent,
        LogoutComponent,
        ChatboxComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        AppRoutingModule,
        HttpClientModule,
        BrowserAnimationsModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    providers: [
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
        },
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        LoginService,
        AuthGuard,
        LoginGuard,
        DashboardGuardService,
        CommonService,
        DashboardService,
        ElasticConfigService,
        ResearchSummaryConfigService,
        AutoSaveService,
        CustomPreloadingStrategy,
        NavigationService,
        WebSocketService
    ],
    bootstrap: [AppComponent]
})

export class AppModule { }
