import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrcidComponent } from './orcid.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { OrderrByPipe } from './directives/orderBy.pipe';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild([{ path: '', component: OrcidComponent }]),
  ],
  declarations: [OrcidComponent, OrderrByPipe],
  exports: [OrcidComponent]
})
export class OrcidModule { }
