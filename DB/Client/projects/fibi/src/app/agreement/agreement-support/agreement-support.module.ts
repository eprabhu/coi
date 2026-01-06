import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgreementSupportComponent } from './agreement-support.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: AgreementSupportComponent }]),
    SharedModule,
    FormsModule
  ],
  declarations: [AgreementSupportComponent]
})
export class AgreementSupportModule { }
