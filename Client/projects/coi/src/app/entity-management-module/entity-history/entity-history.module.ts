import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EntityHistoryComponent } from './entity-history.component';
import { SharedComponentModule } from '../../shared-components/shared-component.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
    declarations: [
        EntityHistoryComponent
    ],
    imports: [
        CommonModule,
        SharedComponentModule,
        SharedModule,
        RouterModule.forChild([{ path: '', component: EntityHistoryComponent }]),
    ]
})
export class EntityHistoryModule { }
