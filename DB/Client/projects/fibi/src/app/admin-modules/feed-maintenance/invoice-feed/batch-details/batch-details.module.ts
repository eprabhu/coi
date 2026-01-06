import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BatchDetailsComponent} from './batch-details.component';
import {RouterModule, Routes} from '@angular/router';
import {FormsModule} from '@angular/forms';
import { SharedModule } from '../../../../shared/shared.module';

const routes: Routes = [{path: '', component: BatchDetailsComponent}];

@NgModule({
    declarations: [BatchDetailsComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,
        SharedModule
    ]
})
export class BatchDetailsModule {
}
