import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../../../../shared/shared.module';
import { AdditionalDetailsComponent } from './additional-details.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        RouterModule.forChild([{ path: '', component: AdditionalDetailsComponent }])
    ],
    declarations: [AdditionalDetailsComponent]
})
export class AdditionalDetailsModule { }
