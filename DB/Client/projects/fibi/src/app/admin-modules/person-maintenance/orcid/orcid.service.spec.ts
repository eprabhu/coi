/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { OrcidService } from './orcid.service';

describe('Service: Orcid', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OrcidService]
    });
  });

  it('should ...', inject([OrcidService], (service: OrcidService) => {
    expect(service).toBeTruthy();
  }));
});
