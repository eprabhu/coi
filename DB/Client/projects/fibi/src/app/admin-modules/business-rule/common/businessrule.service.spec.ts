import { TestBed, inject } from '@angular/core/testing';

import { BusinessRuleService } from './businessrule.service';

describe('BusinessruleService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BusinessRuleService]
    });
  });

  it('should be created', inject([BusinessRuleService], (service: BusinessRuleService) => {
    expect(service).toBeTruthy();
  }));
});
