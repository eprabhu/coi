import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EntitySponsorComponent } from './entity-sponsor.component';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { MatIconModule } from '@angular/material/icon';
import { SharedComponentModule } from '../../shared-components/shared-component.module';
import { SharedEntityManagementModule } from '../shared/shared-entity-management.module';
import { EntitySponsorDetailsComponent } from './entity-sponsor-details/entity-sponsor-details.component';

@NgModule({
    declarations: [
        EntitySponsorComponent,
        EntitySponsorDetailsComponent,
    ],
    imports: [
        CommonModule,
        RouterModule.forChild([{ path: '', component: EntitySponsorComponent }]),
        FormsModule,
        SharedModule,
        MatIconModule,
        SharedComponentModule,
        SharedEntityManagementModule
    ],
    providers: []
})
export class EntitySponsorModule { }
