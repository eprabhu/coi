/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AgreementListService } from './agreement-list.service';

describe('Service: AgreementList', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AgreementListService]
    });
  });

  it('should ...', inject([AgreementListService], (service: AgreementListService) => {
    expect(service).toBeTruthy();
  }));
});
