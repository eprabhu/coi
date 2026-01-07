import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestionnaireComponent } from './questionnaire.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild(
            [
                { path: '', component: QuestionnaireComponent }
            ]
        )
    ],
    declarations: [QuestionnaireComponent]
})
export class QuestionnaireModule { }
