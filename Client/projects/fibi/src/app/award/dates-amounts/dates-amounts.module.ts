import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatesAmountsComponent } from './dates-amounts.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { DatesAmountsService } from './dates-amounts.service';
import { DatesAmountsEditComponent } from './dates-amounts-edit/dates-amounts-edit.component';
import { DatesAmountsViewComponent } from './dates-amounts-view/dates-amounts-view.component';
import { AnticipatedDistributionModule } from '../anticipated-distribution/anticipated-distribution.module';
import { AwardSharedModule } from '../award-shared/award-shared.module';

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild([{ path: '', component: DatesAmountsComponent }]),
        SharedModule,
        FormsModule,
        AnticipatedDistributionModule,
        AwardSharedModule
    ],
    declarations: [
        DatesAmountsComponent,
        DatesAmountsEditComponent,
        DatesAmountsViewComponent
    ],
    providers: [ DatesAmountsService ]
})
export class DatesAmountsModule { }
