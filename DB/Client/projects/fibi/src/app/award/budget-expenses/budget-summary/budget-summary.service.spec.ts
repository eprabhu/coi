/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { BudgetSummaryService } from './budget-summary.service';

describe('Service: BudgetSummary', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BudgetSummaryService]
    });
  });

  it('should ...', inject([BudgetSummaryService], (service: BudgetSummaryService) => {
    expect(service).toBeTruthy();
  }));
});
