import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OtherInformationComponent } from './other-information.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: OtherInformationComponent }]),
    SharedModule,
    FormsModule
  ],
  declarations: [OtherInformationComponent]
})
export class OtherInformationModule { }
