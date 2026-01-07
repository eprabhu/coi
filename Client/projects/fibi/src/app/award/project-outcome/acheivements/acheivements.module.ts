import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AcheivementsComponent } from './acheivements.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{path: '', component: AcheivementsComponent}]),
    FormsModule,
    SharedModule
  ],
  declarations: [AcheivementsComponent],
})
export class AcheivementsModule { }
