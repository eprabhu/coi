import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceDetailsLineItemComponent } from './invoice-details-line-item.component';

describe('InvoiceDetailsLineItemComponent', () => {
  let component: InvoiceDetailsLineItemComponent;
  let fixture: ComponentFixture<InvoiceDetailsLineItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoiceDetailsLineItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceDetailsLineItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
