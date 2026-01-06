import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntitySubawardComponent } from './entity-subaward.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { SharedComponentModule } from '../../shared-components/shared-component.module';
import { SharedEntityManagementModule } from '../shared/shared-entity-management.module';
import { EntitySubawardDetailsComponent } from './entity-subaward-details/entity-subaward-details.component';

@NgModule({
    declarations: [
        EntitySubawardComponent,
        EntitySubawardDetailsComponent,
    ],
    imports: [
        CommonModule,
        RouterModule.forChild([{ path: '', component: EntitySubawardComponent }]),
        FormsModule,
        SharedModule,
        SharedComponentModule,
        SharedEntityManagementModule
    ],
    providers: []
})
export class EntitySubawardModule { }
