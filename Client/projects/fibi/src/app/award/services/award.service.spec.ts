/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AwardService } from './award.service';

describe('Service: Award', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AwardService]
    });
  });

  it('should ...', inject([AwardService], (service: AwardService) => {
    expect(service).toBeTruthy();
  }));
});
