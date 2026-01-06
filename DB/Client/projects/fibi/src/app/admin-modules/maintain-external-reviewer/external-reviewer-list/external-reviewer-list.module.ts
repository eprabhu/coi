import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ExternalReviewerListComponent } from './external-reviewer-list.component';
import { SharedModule } from '../../../shared/shared.module';


@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        RouterModule.forChild([{ path: '', component: ExternalReviewerListComponent }])
    ],
    declarations: [ExternalReviewerListComponent]
})
export class ExternalReviewerListModule { }
