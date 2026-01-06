import { TestBed, inject } from '@angular/core/testing';

import { ModularBudgetService } from './modular-budget.service';

describe('ModularBudgetService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ModularBudgetService]
    });
  });

  it('should be created', inject([ModularBudgetService], (service: ModularBudgetService) => {
    expect(service).toBeTruthy();
  }));
});
