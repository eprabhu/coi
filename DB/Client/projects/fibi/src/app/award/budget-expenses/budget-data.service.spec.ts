import { TestBed, inject } from '@angular/core/testing';

import { BudgetDataService } from './budget-data.service';

describe('BudgetDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BudgetDataService]
    });
  });

  it('should be created', inject([BudgetDataService], (service: BudgetDataService) => {
    expect(service).toBeTruthy();
  }));
});
