import { TestBed, inject } from '@angular/core/testing';

import { GrantCallService } from './grant.service';

describe('GrantService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GrantCallService]
    });
  });

  it('should be created', inject([GrantCallService], (service: GrantCallService) => {
    expect(service).toBeTruthy();
  }));
});
