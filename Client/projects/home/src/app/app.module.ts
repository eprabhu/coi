import {APP_INITIALIZER, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {CommonService} from "./common/services/common.service";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {AppRouterComponent} from './common/app-router/app-router.component';
import {HeaderComponent} from "./common/header/header.component";
import {FooterComponent} from "./common/footer/footer.component";
import {LoginComponent} from "./login/login.component";
import {AppHttpInterceptor} from "./common/services/http-interceptor";
import {FormsModule} from "@angular/forms";
import {HashLocationStrategy, LocationStrategy} from "@angular/common";
import {LogoutComponent} from "./logout/logout.component";

export function getappConfiguration(appConfigurationServiceService: CommonService) {
    return () => appConfigurationServiceService.getAppConfig();
}

@NgModule({
    declarations: [
        AppComponent,
        AppRouterComponent,
        HeaderComponent,
        FooterComponent,
        LoginComponent,
        LogoutComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        FormsModule
    ],
    providers: [CommonService,
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
        {provide: LocationStrategy, useClass: HashLocationStrategy},
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
