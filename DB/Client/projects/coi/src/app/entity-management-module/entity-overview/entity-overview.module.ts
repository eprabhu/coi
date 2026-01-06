import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntityOverviewComponent } from './entity-overview.component';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { BasicDetailsComponent } from './basic-details/basic-details.component';
import { SharedModule } from '../../shared/shared.module';
import { IndustryDetailsComponent } from './industry-details/industry-details.component';
import { SharedComponentModule } from '../../shared-components/shared-component.module';
import { RegistrationDetailsComponent } from './registration-details/registration-details.component';
import { AdditionalAddressesComponent } from './additional-addresses/additional-addresses.component';
import { OtherDetailsComponent } from './other-details/other-details.component';
import { OtherReferenceIdComponent } from './other-reference-id/other-reference-id.component';
import { SharedEntityManagementModule } from '../shared/shared-entity-management.module';
import { EntityOverviewService } from './entity-overview.service';
import { EntityAdditionalDetailsComponent } from './entity-additional-details/entity-additional-details.component';

@NgModule({
    declarations: [
        EntityOverviewComponent,
        BasicDetailsComponent,
        IndustryDetailsComponent,
        RegistrationDetailsComponent,
        AdditionalAddressesComponent,
        OtherDetailsComponent,
        OtherReferenceIdComponent,
        EntityAdditionalDetailsComponent,
    ],
    imports: [
        CommonModule,
        RouterModule.forChild([{ path: '', component: EntityOverviewComponent }]),
        FormsModule,
        SharedModule,
        MatIconModule,
        SharedComponentModule,
        SharedEntityManagementModule
    ],
    providers: [
        EntityOverviewService
    ]
})
export class EntityFormOverviewModule {}
