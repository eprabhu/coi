import { SharedModule } from './../../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OtherInformationComponent } from './other-information.component';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([{ path: '', component: OtherInformationComponent }])
  ],
  declarations: [OtherInformationComponent]
})
export class OtherInformationModule { }
