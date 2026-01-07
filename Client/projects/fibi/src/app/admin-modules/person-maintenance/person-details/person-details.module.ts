import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonDetailsComponent } from './person-details.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild([{ path: '', component: PersonDetailsComponent }]),
  ],
  declarations: [PersonDetailsComponent]
})
export class PersonDetailsModule { }
