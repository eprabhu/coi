import { TestBed } from '@angular/core/testing';

import { SapFeedService } from './sap-feed.service';

describe('SapFeedService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SapFeedService = TestBed.get(SapFeedService);
    expect(service).toBeTruthy();
  });
});
