import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ScreeningQuestionnaireComponent } from './screening-questionnaire.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild([{ path: '', component: ScreeningQuestionnaireComponent }])
    ],
    declarations: [ScreeningQuestionnaireComponent]
})
export class ScreeningQuestionnaireModule { }
