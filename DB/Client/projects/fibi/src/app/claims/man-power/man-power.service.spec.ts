/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ManPowerService } from './man-power.service';

describe('Service: ManPower', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ManPowerService]
    });
  });

  it('should ...', inject([ManPowerService], (service: ManPowerService) => {
    expect(service).toBeTruthy();
  }));
});
