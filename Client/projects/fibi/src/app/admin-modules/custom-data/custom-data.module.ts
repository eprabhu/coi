import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModifyCustomdataMainComponent } from './modify-customdata-main/modify-customdata-main.component';
import { ModifyPreviewCustomdataComponent } from './modify-preview-customdata/modify-preview-customdata.component';
import { CustomDataService } from './services/custom-data.service';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { CustomDataSearchFilterPipe } from './directives/customDataSearchFilter.pipe';
import { SharedModule } from '../../shared/shared.module';
import { DragDropModule } from '@angular/cdk/drag-drop';

const routes: Routes = [{ path: '', component: ModifyCustomdataMainComponent }];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    SharedModule,
    DragDropModule
  ],
  exports: [RouterModule],
  declarations: [CustomDataSearchFilterPipe, ModifyCustomdataMainComponent, ModifyPreviewCustomdataComponent],
  providers: [CustomDataService]
})
export class CustomDataModule { }
