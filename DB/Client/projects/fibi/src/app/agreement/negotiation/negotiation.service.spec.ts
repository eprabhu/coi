/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { NegotiationService } from './negotiation.service';

describe('Service: Negotiation', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NegotiationService]
    });
  });

  it('should ...', inject([NegotiationService], (service: NegotiationService) => {
    expect(service).toBeTruthy();
  }));
});
