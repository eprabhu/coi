import { TestBed, inject } from '@angular/core/testing';

import { GrantHistoryService } from './grant-history.services';

describe('GrantHistoryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GrantHistoryService]
    });
  });

  it('should be created', inject([GrantHistoryService], (service: GrantHistoryService) => {
    expect(service).toBeTruthy();
  }));
});
