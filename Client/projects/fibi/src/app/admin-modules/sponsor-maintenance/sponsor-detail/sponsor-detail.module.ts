import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SponsorDetailComponent } from './sponsor-detail.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild([{ path: '', component: SponsorDetailComponent }]),
  ],
  declarations: [SponsorDetailComponent]
})
export class SponsorDetailModule { }
