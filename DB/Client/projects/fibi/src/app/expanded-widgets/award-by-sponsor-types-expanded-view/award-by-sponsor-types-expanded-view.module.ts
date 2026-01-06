import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AwardBySponsorTypesExpandedViewComponent } from './award-by-sponsor-types-expanded-view.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  { path: '', component: AwardBySponsorTypesExpandedViewComponent }
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [AwardBySponsorTypesExpandedViewComponent]
})
export class AwardBySponsorTypesExpandedViewModule { }
