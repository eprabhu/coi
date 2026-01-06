import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AwardQuestionnaireComponent } from './award-questionnaire.component';
import { SharedModule } from '../../shared/shared.module';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([{ path: '', component: AwardQuestionnaireComponent }]),
  ],
  declarations: [AwardQuestionnaireComponent]
})
export class AwardQuestionnaireModule { }
