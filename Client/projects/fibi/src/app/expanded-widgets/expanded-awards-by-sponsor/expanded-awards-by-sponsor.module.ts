import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpandedAwardsBySponsorComponent } from './expanded-awards-by-sponsor.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([{path: '', component: ExpandedAwardsBySponsorComponent}])
  ],
  declarations: [ExpandedAwardsBySponsorComponent]
})
export class ExpandedAwardsBySponsorModule { }
