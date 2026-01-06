/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SponsorTermsService } from './sponsor-terms.service';

describe('Service: SponsorTerms', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SponsorTermsService]
    });
  });

  it('should ...', inject([SponsorTermsService], (service: SponsorTermsService) => {
    expect(service).toBeTruthy();
  }));
});
