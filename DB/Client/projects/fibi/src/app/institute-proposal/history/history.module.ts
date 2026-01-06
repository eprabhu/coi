import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryComponent } from './history.component';
import { RouterModule } from '@angular/router';
import { HistoryService } from './history.service';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: HistoryComponent }]),
    SharedModule
  ],
  declarations: [HistoryComponent],
  providers: [HistoryService]
})
export class HistoryModule { }
