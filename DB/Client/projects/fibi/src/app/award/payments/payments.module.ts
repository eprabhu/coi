import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentsComponent } from './payments.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { PaymentService } from './payment.service';
import { PaymentEditComponent } from './payment-edit/payment-edit.component';
import { PaymentViewComponent } from './payment-view/payment-view.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: PaymentsComponent }]),
    SharedModule,
    FormsModule
  ],
  declarations: [PaymentsComponent, PaymentEditComponent, PaymentViewComponent],
  providers: [PaymentService]
})
export class PaymentsModule { }
