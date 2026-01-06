import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ManPowerComponent} from './man-power.component';
import {RouterModule, Routes} from '@angular/router';
import { ManpowerSummaryComponent } from './manpower-summary/manpower-summary.component';
import { ManpowerDetailsComponent } from './manpower-details/manpower-details.component';
import { ManPowerService } from './man-power.service';
import { SharedModule } from '../../shared/shared.module';
import {FormsModule} from '@angular/forms';

const routes: Routes = [
    {path: '', component: ManPowerComponent}
];

@NgModule({
    declarations: [ManPowerComponent, ManpowerSummaryComponent, ManpowerDetailsComponent],
    imports: [
        RouterModule.forChild(routes),
        CommonModule,
        SharedModule,
        FormsModule
    ],
    providers: [ManPowerService]
})
export class ManPowerModule {
}
