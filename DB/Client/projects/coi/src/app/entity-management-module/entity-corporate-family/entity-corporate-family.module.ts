import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntityCorporateFamilyComponent } from './entity-corporate-family.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { SharedComponentModule } from '../../shared-components/shared-component.module';
import { SharedModule } from '../../shared/shared.module';
import { SharedEntityManagementModule } from '../shared/shared-entity-management.module';
import { CorporateFamilyTreeComponent } from './corporate-family-tree/corporate-family-tree.component';
import { EntityCorporateFamilyService } from './entity-corporate-family.service';

@NgModule({
    declarations: [
        EntityCorporateFamilyComponent,
        CorporateFamilyTreeComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild([{ path: '', component: EntityCorporateFamilyComponent }]),
        FormsModule,
        SharedModule,
        MatIconModule,
        SharedComponentModule,
        SharedEntityManagementModule
    ],
    providers: [EntityCorporateFamilyService]
})
export class EntityCorporateFamilyModule { }
