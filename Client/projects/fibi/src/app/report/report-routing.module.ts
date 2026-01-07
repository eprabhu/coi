import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { TemplateComponent } from './template/template.component';

const routes: Routes = [
  { path: '', redirectTo: 'template', pathMatch: 'full' },
  {
    path: 'template',
    component: TemplateComponent,
  }];

@NgModule({
  imports: [RouterModule.forChild(routes),
    CommonModule
  ],
  declarations: [],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
