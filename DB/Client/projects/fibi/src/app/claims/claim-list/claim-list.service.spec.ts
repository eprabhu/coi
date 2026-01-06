/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ClaimListService } from './claim-list.service';

describe('Service: ClaimList', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClaimListService]
    });
  });

  it('should ...', inject([ClaimListService], (service: ClaimListService) => {
    expect(service).toBeTruthy();
  }));
});
