import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BatchHistoryComponent} from './batch-history.component';
import {RouterModule, Routes} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../../shared/shared.module';

const routes: Routes = [{path: '', component: BatchHistoryComponent}];

@NgModule({
    declarations: [BatchHistoryComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,
        SharedModule

    ]})

export class BatchHistoryModule {
}
