import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {TravelCertificationComponent} from './travel-certification.component';
import {SharedModule} from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        RouterModule.forChild([{ path: '', component: TravelCertificationComponent }])
    ],
    declarations: [TravelCertificationComponent]
})
export class TravelCertificationModule { }
