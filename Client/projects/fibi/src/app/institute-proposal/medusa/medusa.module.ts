import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedusaComponent } from './medusa.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: MedusaComponent }]),
    SharedModule
  ],
  declarations: [MedusaComponent]
})
export class MedusaModule { }
