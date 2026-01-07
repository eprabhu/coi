import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SponsorHierarchyComponent } from './sponsor-hierarchy.component';
import { RouterModule, Routes } from '@angular/router';
import { SponsorHierarchyTreeviewComponent } from './Sponsor-hierarchy-treeview/Sponsor-hierarchy-treeview.component';
import { SponsorHierarchyListComponent } from './sponsor-hierarchy-list/sponsor-hierarchy-list.component';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';


const routes: Routes = [{ path: '', component: SponsorHierarchyComponent},
];
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild((routes)),
    SharedModule
  ],
  declarations: [SponsorHierarchyComponent, SponsorHierarchyTreeviewComponent, SponsorHierarchyListComponent]
})
export class SponsorHierarchyModule { }
