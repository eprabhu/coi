import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryComponent } from './history.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { SharedComponentModule } from '../../shared-components/shared-component.module';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        SharedComponentModule,
        RouterModule.forChild([{ path: '', component: HistoryComponent }])
    ],
    declarations: [HistoryComponent]
})
export class HistoryModule { }
