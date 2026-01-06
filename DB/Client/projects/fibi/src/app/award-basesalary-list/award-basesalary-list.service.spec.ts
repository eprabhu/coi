/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AwardBasesalaryListService } from './award-basesalary-list.service';

describe('Service: AwardBasesalaryList', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AwardBasesalaryListService]
    });
  });

  it('should ...', inject([AwardBasesalaryListService], (service: AwardBasesalaryListService) => {
    expect(service).toBeTruthy();
  }));
});
