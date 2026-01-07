import { FormsModule } from '@angular/forms';
import { SharedModule } from './../../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AwardListComponent } from './award-list.component';
import {RouterModule, Routes} from '@angular/router';
import { AwardListService } from './award-list.service';

const routes: Routes = [
  {path: '', component: AwardListComponent}
];
@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [AwardListComponent],
  
  providers: [AwardListService]

  
})
export class AwardListModule { }
