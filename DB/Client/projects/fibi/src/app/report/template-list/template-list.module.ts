import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateListComponent } from './template-list.component';
import {RouterModule, Routes} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { TemplateListService } from './template-list.service';

const routes: Routes = [
  {path: '', component: TemplateListComponent}
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    RouterModule.forChild(routes)
  ],
  declarations: [TemplateListComponent],
  exports: [TemplateListComponent],
  providers: [TemplateListService]
})
export class TemplateListModule { }
