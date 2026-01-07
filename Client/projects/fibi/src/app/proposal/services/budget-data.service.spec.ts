/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { BudgetDataService } from './budget-data.service';

describe('Service: BudgetData', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BudgetDataService]
    });
  });

  it('should ...', inject([BudgetDataService], (service: BudgetDataService) => {
    expect(service).toBeTruthy();
  }));
});
