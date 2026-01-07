import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AwardHierarchyComponent } from './award-hierarchy.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { AwardHierarchyService } from './award-hierarchy.service';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: AwardHierarchyComponent }]),
    SharedModule,
    FormsModule
  ],
  declarations: [AwardHierarchyComponent],
  providers: [AwardHierarchyService]
})
export class AwardHierarchyModule { }
