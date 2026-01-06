import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeyPerformanceIndicatorComponent } from './key-performance-indicator.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { KeyPerformanceIndicatorService } from './key-performance-indicator.service';
import { KpiEditComponent } from './kpi-edit/kpi-edit.component';
import { KpiViewComponent } from './kpi-view/kpi-view.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: KeyPerformanceIndicatorComponent }]),
    SharedModule,
    FormsModule,
  ],
  declarations: [KeyPerformanceIndicatorComponent,
                 KpiEditComponent,
                 KpiViewComponent],
  providers: [KeyPerformanceIndicatorService]
})
export class KeyPerformanceIndicatorModule { }
