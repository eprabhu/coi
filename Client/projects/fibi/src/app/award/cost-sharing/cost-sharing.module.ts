import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CostSharingComponent } from './cost-sharing.component';
import { CostSharingEditComponent } from './cost-sharing-edit/cost-sharing-edit.component';
import { CostSharingViewComponent } from './cost-sharing-view/cost-sharing-view.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { CostSharingService } from './cost-sharing.service';
import { AnticipatedDistributionModule } from '../anticipated-distribution/anticipated-distribution.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: CostSharingComponent }]),
    SharedModule,
    FormsModule,
    AnticipatedDistributionModule
  ],
  declarations: [CostSharingComponent, CostSharingEditComponent, CostSharingViewComponent],
  providers: [CostSharingService]
})
export class CostSharingModule { }
