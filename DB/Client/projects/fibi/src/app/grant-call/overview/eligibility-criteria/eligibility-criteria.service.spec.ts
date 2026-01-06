/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { EligibilityCriteriaService } from './eligibility-criteria.service';

describe('Service: EligibilityCriteria', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EligibilityCriteriaService]
    });
  });

  it('should ...', inject([EligibilityCriteriaService], (service: EligibilityCriteriaService) => {
    expect(service).toBeTruthy();
  }));
});
