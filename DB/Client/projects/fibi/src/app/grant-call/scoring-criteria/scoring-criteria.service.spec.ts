/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ScoringCriteriaService } from './scoring-criteria.service';

describe('Service: ScoringCriteria', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ScoringCriteriaService]
    });
  });

  it('should ...', inject([ScoringCriteriaService], (service: ScoringCriteriaService) => {
    expect(service).toBeTruthy();
  }));
});
