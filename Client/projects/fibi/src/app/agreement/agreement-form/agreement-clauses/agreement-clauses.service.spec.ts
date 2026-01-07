import { TestBed, inject } from '@angular/core/testing';

import { AgreementClausesService } from './agreement-clauses.service';

describe('AgreementClausesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AgreementClausesService]
    });
  });

  it('should be created', inject([AgreementClausesService], (service: AgreementClausesService) => {
    expect(service).toBeTruthy();
  }));
});
