import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DetailsBreakdownComponent} from './details-breakdown.component';
import {RouterModule, Routes} from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { PreviousExcludedComponent } from './previous-excluded/previous-excluded.component';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
    {path: '', component: DetailsBreakdownComponent}
];

@NgModule({
    declarations: [DetailsBreakdownComponent, PreviousExcludedComponent],
    imports: [
        RouterModule.forChild(routes),
        CommonModule,
        SharedModule,
        FormsModule
    ]
})
export class DetailsBreakdownModule {
}
