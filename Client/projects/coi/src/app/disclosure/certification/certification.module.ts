import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {CertificationComponent} from './certification.component';
import {SharedModule} from '../../shared/shared.module';


@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild([{ path: '', component: CertificationComponent }])
    ],
    declarations: [CertificationComponent]
})
export class CertificationModule { }
