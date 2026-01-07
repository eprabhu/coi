import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AwardOverviewModalCardComponent } from './award-overview-modal-card/award-overview-modal-card.component';
import { CommonDataService } from '../services/common-data.service';
import { SharedModule } from '../../shared/shared.module';




@NgModule({
  declarations: [
    AwardOverviewModalCardComponent,
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  exports: [AwardOverviewModalCardComponent]
})
export class AwardSharedModule { }
