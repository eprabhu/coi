/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CoiSummaryService } from './coi-summary.service';

describe('Service: CoiSummary', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CoiSummaryService]
    });
  });

  it('should ...', inject([CoiSummaryService], (service: CoiSummaryService) => {
    expect(service).toBeTruthy();
  }));
});
