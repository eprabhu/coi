/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AgreementService } from './agreement.service';

describe('Service: Agreement', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AgreementService]
    });
  });

  it('should ...', inject([AgreementService], (service: AgreementService) => {
    expect(service).toBeTruthy();
  }));
});
