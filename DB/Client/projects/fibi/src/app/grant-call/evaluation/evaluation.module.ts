import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EvaluationComponent } from './evaluation.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { EvaluationService } from './evaluation.service';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: EvaluationComponent }]),
    SharedModule,
    FormsModule,
  ],
  declarations: [EvaluationComponent],
  providers: [EvaluationService]
})
export class EvaluationModule { }
