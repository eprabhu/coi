import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupportExpandedViewComponent } from './support-expanded-view.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  { path: '', component: SupportExpandedViewComponent }
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [SupportExpandedViewComponent]
})
export class SupportExpandedViewModule { }
