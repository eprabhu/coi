/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AgreementCommonDataService } from './agreement-common-data.service';

describe('Service: AgreementCommonData', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AgreementCommonDataService]
    });
  });

  it('should ...', inject([AgreementCommonDataService], (service: AgreementCommonDataService) => {
    expect(service).toBeTruthy();
  }));
});
