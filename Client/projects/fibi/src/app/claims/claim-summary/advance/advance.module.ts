import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { AdvanceComponent } from './advance.component';

const routes = [{
    path: '', component: AdvanceComponent,
  }];
  @NgModule({
    imports: [
      CommonModule,
      RouterModule.forChild(routes),
      SharedModule,
      FormsModule
    ],
    declarations: [AdvanceComponent],
})
export class AdvanceModule {
}
