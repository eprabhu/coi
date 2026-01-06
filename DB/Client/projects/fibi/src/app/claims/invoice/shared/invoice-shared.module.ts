import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {InvoiceLineItemComponent} from './invoice-line-item/invoice-line-item.component';
import {FormsModule} from '@angular/forms';
import {SharedModule} from '../../../shared/shared.module';


@NgModule({
    declarations: [InvoiceLineItemComponent],
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
    ],
    exports: [InvoiceLineItemComponent]
})
export class InvoiceSharedModule {
}
