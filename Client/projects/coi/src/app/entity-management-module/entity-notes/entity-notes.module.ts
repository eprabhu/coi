import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntityNotesComponent } from './entity-notes.component';
import { RouterModule } from '@angular/router';
import { SharedComponentModule } from '../../shared-components/shared-component.module';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from '../../shared/shared.module';
import { SharedEntityManagementModule } from '../shared/shared-entity-management.module';

@NgModule({
  declarations: [
    EntityNotesComponent
  ],
  imports: [
    CommonModule,
    SharedComponentModule,
    RouterModule.forChild([{ path: '', component: EntityNotesComponent}]),
    FormsModule,
    SharedModule,
    MatIconModule,
    SharedEntityManagementModule
  ],
  exports: [
    EntityNotesComponent
  ]
})
export class EntityNotesModule { }
