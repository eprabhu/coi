import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FormSharedModule } from '../../configuration/form-builder-create/shared/shared.module';
import { SharedModule } from '../../shared/shared.module';
import { TravelDisclosureEngagementsComponent } from './travel-disclosure-engagements.component';
import { EntityDetailsModule } from '../../disclosure/entity-details/entity-details.module';
import { SharedComponentModule } from '../../shared-components/shared-component.module';

@NgModule({
    declarations: [
        TravelDisclosureEngagementsComponent
    ],
    imports: [
        RouterModule.forChild([{
            path: '', component: TravelDisclosureEngagementsComponent,
            children: [
                {
                    path: '', loadChildren: () => import('../../user-dashboard/user-entities/user-entities.module').then(m => m.UserEntitiesModule)
                },
            ]
        }]),
        CommonModule,
        SharedModule,
        FormsModule,
        FormSharedModule,
        EntityDetailsModule,
        SharedComponentModule
    ]
})
export class TravelDisclosureEngagementsModule { }
