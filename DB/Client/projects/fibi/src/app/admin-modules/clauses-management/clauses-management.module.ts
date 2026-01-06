import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClausesManagementRoutingModule } from './clauses-management-routing.module';
import { ClausesManagementComponent } from './clauses-management.component';
import { ClausesManagementService } from './clauses-management.service';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    ClausesManagementRoutingModule,
    FormsModule,
    SharedModule
  ],
  declarations: [ClausesManagementComponent],
  providers: [ClausesManagementService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ClausesManagementModule { }
