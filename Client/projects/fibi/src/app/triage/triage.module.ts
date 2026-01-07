import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TriageComponent } from './triage.component';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import { TriageService } from './triage.service';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([{ path: '', component: TriageComponent}]),
  ],
  declarations: [TriageComponent],
  providers: [TriageService]
})
export class TriageModule { }
