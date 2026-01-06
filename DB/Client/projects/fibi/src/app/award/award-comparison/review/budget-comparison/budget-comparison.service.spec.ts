/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { BudgetComparisonService } from './budget-comparison.service';

describe('Service: BudgetComparison', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BudgetComparisonService]
    });
  });

  it('should ...', inject([BudgetComparisonService], (service: BudgetComparisonService) => {
    expect(service).toBeTruthy();
  }));
});
