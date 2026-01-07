import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GrantHistoryComponent } from './grant-history.component';
import { RouterModule } from '@angular/router';
import { GrantHistoryService } from './grant-history.services';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild([{ path: '', component: GrantHistoryComponent }]),
  ],
  declarations: [GrantHistoryComponent],
  providers: [GrantHistoryService]
})
export class GrantHistoryModule { }
