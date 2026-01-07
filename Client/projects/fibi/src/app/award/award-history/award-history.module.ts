// Last updated by Krishnanunni on 05-12-2019
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AwardHistoryComponent } from './award-history.component';
import { AwardHistoryService } from './award-history.service';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([{ path: '', component: AwardHistoryComponent }]),
  ],
  declarations: [AwardHistoryComponent],
  providers: [AwardHistoryService]
})
export class AwardHistoryModule { }
