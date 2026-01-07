import { RatePipeService } from './rate-maintainance/rate-pipe.service';
import { UnitHierarchyService } from './unit-hierarchy.service';
import { FilterPipe } from './filter.pipe';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HierarchyTreeviewComponent } from './hierarchy-treeview/hierarchy-treeview.component';
import { RateMaintainanceComponent } from './rate-maintainance/rate-maintainance.component';
import { SharedModule } from '../../shared/shared.module';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [{ path: '', component: HierarchyTreeviewComponent},
                        { path: 'rateMaintainance', component: RateMaintainanceComponent },
                        { path: 'LArateMaintainance', component: RateMaintainanceComponent }
];
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule],
  declarations: [HierarchyTreeviewComponent, RateMaintainanceComponent, FilterPipe ],
  providers: [UnitHierarchyService, RatePipeService]
})
export class UnitHierarchyModule {  }
