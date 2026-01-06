import { TestBed, inject } from '@angular/core/testing';

import { DatesAmountsService } from './dates-amounts.service';

describe('DatesAmountsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DatesAmountsService]
    });
  });

  it('should be created', inject([DatesAmountsService], (service: DatesAmountsService) => {
    expect(service).toBeTruthy();
  }));
});
