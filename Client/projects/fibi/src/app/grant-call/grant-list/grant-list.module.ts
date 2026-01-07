import { CalendarViewComponent } from './../../shared/calendar-view/calendar-view.component';
import { FormsModule} from '@angular/forms';
import { SharedModule } from './../../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GrantListComponent } from './grant-list.component';
import {RouterModule, Routes} from '@angular/router';
import { GrantListService } from './grant-list.service';

const routes: Routes = [
  {path: '', component: GrantListComponent}
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [GrantListComponent,
    CalendarViewComponent],
  providers:[GrantListService]
})
export class GrantListModule { }
