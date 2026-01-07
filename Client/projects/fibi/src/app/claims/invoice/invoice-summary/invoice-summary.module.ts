import { FormsModule } from '@angular/forms';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {InvoiceSummaryComponent} from './invoice-summary.component';
import {RouterModule, Routes} from '@angular/router';
import {SharedModule} from '../../../shared/shared.module';
import {InvoiceSharedModule} from '../shared/invoice-shared.module';

const routes: Routes = [{path: '', component: InvoiceSummaryComponent}];

@NgModule({
    declarations: [InvoiceSummaryComponent],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(routes),
        SharedModule,
        InvoiceSharedModule,
    ]
})
export class InvoiceSummaryModule {
}
