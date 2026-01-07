import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScoringCriteriaComponent } from './scoring-criteria.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { ScoringCriteriaViewComponent } from './scoring-criteria-view/scoring-criteria-view.component';
import { ScoringCriteriaService } from './scoring-criteria.service';
import { ScoringCriteriaEditComponent } from './scoring-criteria-edit/scoring-criteria-edit.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: ScoringCriteriaComponent }]),
    SharedModule,
    FormsModule,
  ],
  declarations: [ScoringCriteriaComponent, ScoringCriteriaViewComponent, ScoringCriteriaEditComponent],
  providers: [ScoringCriteriaService]
})
export class ScoringCriteriaModule { }
