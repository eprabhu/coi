import { TestBed } from '@angular/core/testing';

import { TravelDataStoreService } from './travel-data-store.service';

describe('TravelDataStoreService', () => {
  let service: TravelDataStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TravelDataStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
