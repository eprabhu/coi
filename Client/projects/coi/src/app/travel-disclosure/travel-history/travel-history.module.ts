import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TravelHistoryComponent } from './travel-history.component';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { SharedComponentModule } from '../../shared-components/shared-component.module';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [{ path: '', component: TravelHistoryComponent }];

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        RouterModule.forChild(routes),
        SharedComponentModule,
    ],
    declarations: [TravelHistoryComponent]
})
export class TravelHistoryModule { }
