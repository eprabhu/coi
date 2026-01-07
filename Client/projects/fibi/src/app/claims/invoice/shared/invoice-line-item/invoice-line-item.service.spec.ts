import { TestBed } from '@angular/core/testing';

import { InvoiceLineItemService } from './invoice-line-item.service';

describe('InvoiceLineItemService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: InvoiceLineItemService = TestBed.get(InvoiceLineItemService);
    expect(service).toBeTruthy();
  });
});
