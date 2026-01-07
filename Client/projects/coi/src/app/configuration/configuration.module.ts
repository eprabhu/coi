import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ConfigurationComponent} from './configuration.component';
import {RouterModule, Routes} from '@angular/router';
import {ConfigurationService} from './configuration.service';

const routes: Routes = [{path: '', component: ConfigurationComponent}];

@NgModule({
    declarations: [
        ConfigurationComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes)
    ],
    providers: [ConfigurationService]
})
export class ConfigurationModule {
}
