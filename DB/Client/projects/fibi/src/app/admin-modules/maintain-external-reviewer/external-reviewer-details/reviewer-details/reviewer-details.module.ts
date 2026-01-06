import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../../../../shared/shared.module';
import { ReviewerDetailsComponent } from './reviewer-details.component';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        RouterModule.forChild([{ path: '', component: ReviewerDetailsComponent }])
    ],
    declarations: [ReviewerDetailsComponent]
})
export class ReviewerDetailsModule { }
