import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateManagementComponent } from './template-management.component';
import { TemplateComponent } from './template/template.component';
import { ClausesComponent } from './clauses/clauses.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { PlaceholderComponent } from './placeholder/placeholder.component';
import { PlaceholderServiceService } from './placeholder/placeholder-service.service';
import { ClausesService } from './clauses/clauses.service';
import { TemplateService } from './template/template.service';
import { FilterPipe } from './filter.pipe';
import { AgreementService } from '../../agreement/agreement.service';

const routes: Routes = [{
  path: '', component: TemplateManagementComponent,
  children: [
    { path: '', redirectTo: 'clauses', pathMatch: 'full' },
    { path: 'template', component: TemplateComponent },
    { path: 'clauses', component: ClausesComponent },
    { path: 'placeholder', component: PlaceholderComponent }
  ]
}];
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    FormsModule
  ],
  declarations: [
    TemplateManagementComponent,
     TemplateComponent,
     ClausesComponent,
     PlaceholderComponent,
     FilterPipe],
  providers: [PlaceholderServiceService, ClausesService, TemplateService, AgreementService]
})
export class TemplateManagementModule { }
