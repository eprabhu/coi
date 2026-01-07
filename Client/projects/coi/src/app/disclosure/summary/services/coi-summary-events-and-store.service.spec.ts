/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CoiSummaryEventsAndStoreService } from './coi-summary-events-and-store.service';

describe('Service: CoiSummaryEventsAndStore', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CoiSummaryEventsAndStoreService]
    });
  });

  it('should ...', inject([CoiSummaryEventsAndStoreService], (service: CoiSummaryEventsAndStoreService) => {
    expect(service).toBeTruthy();
  }));
});
