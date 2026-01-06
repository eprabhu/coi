import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PendingFeedsComponent} from './pending-feeds.component';
import {RouterModule, Routes} from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../../shared/shared.module';

const routes: Routes = [{path: '', component: PendingFeedsComponent}];

@NgModule({
    declarations: [PendingFeedsComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,
        SharedModule
    ]
})
export class PendingFeedsModule {
}
