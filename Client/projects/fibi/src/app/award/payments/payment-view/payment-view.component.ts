import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-payment-view',
  templateUrl: './payment-view.component.html',
  styleUrls: ['./payment-view.component.css']
})
export class PaymentViewComponent implements OnInit {
  @Input() result: any = {};
  isPaymentWidgetOpen = false;
  isHighlighted = false;

  constructor() { }

  ngOnInit() {
  }

}
