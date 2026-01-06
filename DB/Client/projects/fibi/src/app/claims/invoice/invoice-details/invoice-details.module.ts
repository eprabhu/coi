import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {InvoiceDetailsComponent} from './invoice-details.component';
import {RouterModule, Routes} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {SharedModule} from '../../../shared/shared.module';
import {InvoiceSharedModule} from '../shared/invoice-shared.module';

const routes: Routes = [{path: '', component: InvoiceDetailsComponent}];

@NgModule({
    declarations: [InvoiceDetailsComponent],
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        InvoiceSharedModule,
        RouterModule.forChild(routes)
    ]
})
export class InvoiceDetailsModule {
}
