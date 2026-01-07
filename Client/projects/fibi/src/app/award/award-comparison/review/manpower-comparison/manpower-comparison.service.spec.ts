/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ManpowerComparisionService } from './manpower-comparison.service';

describe('Service: ManpowerComparision', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ManpowerComparisionService]
    });
  });

  it('should ...', inject([ManpowerComparisionService], (service: ManpowerComparisionService) => {
    expect(service).toBeTruthy();
  }));
});
