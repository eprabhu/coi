import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpandedWidgetsComponent } from './expanded-widgets.component';
import { FormsModule } from '@angular/forms';
import { ExpandedWidgetsRoutingModule } from './expanded-widgets-routing.module';
import { ExpandedWidgetsService } from './expanded-widgets.service';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    ExpandedWidgetsRoutingModule
  ],
  declarations: [ExpandedWidgetsComponent],
  providers: [ExpandedWidgetsService]
})
export class ExpandedWidgetsModule { }
