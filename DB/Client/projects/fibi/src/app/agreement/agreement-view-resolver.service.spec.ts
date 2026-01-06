/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AgreementViewResolverService } from './agreement-view-resolver.service';

describe('Service: AgreementViewResolver', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AgreementViewResolverService]
    });
  });

  it('should ...', inject([AgreementViewResolverService], (service: AgreementViewResolverService) => {
    expect(service).toBeTruthy();
  }));
});
