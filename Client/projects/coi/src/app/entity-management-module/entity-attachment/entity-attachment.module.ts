import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EntityAttachmentComponent } from './entity-attachment.component';
import { SharedComponentModule } from '../../shared-components/shared-component.module';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { MatIconModule } from '@angular/material/icon';
import { SharedEntityManagementModule } from '../shared/shared-entity-management.module';
import { EntityAttachmentService } from './entity-attachment.service';


@NgModule({
  declarations: [
    EntityAttachmentComponent
  ],
  imports: [
    CommonModule,
    SharedComponentModule,
    RouterModule.forChild([{ path: '', component: EntityAttachmentComponent}]),
    FormsModule,
    SharedModule,
    MatIconModule,
    SharedEntityManagementModule
  ],
  providers: [
    EntityAttachmentService
  ]
})
export class EntityAttachmentModule { }
