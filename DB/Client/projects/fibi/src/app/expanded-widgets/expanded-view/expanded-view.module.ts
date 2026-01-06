import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ExpandedViewComponent } from './expanded-view.component';
import { ExpandedViewService } from './expanded-view.service';

const routes: Routes = [
  {path: '', component: ExpandedViewComponent}
];

@NgModule({
    imports: [
      CommonModule,
      RouterModule.forChild(routes),
      SharedModule
    ],
    declarations: [ExpandedViewComponent],
    providers : [ExpandedViewService]
  })
  export class ExpandedViewModule {}
  