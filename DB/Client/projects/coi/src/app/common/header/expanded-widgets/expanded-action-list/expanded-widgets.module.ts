import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpandedActionListComponent } from './expanded-action-list.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'projects/coi/src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild([{path:'', component: ExpandedActionListComponent}])
  ],
  declarations: [ExpandedActionListComponent]
})
export class ExpandedActionListModule { }
