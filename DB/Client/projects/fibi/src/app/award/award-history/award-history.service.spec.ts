import { TestBed, inject } from '@angular/core/testing';

import { AwardHistoryService } from './award-history.service';

describe('AwardHistoryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AwardHistoryService]
    });
  });

  it('should be created', inject([AwardHistoryService], (service: AwardHistoryService) => {
    expect(service).toBeTruthy();
  }));
});
