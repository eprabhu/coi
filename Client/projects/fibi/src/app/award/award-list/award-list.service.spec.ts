/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AwardListService } from './award-list.service';

describe('Service: AwardList', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AwardListService]
    });
  });

  it('should ...', inject([AwardListService], (service: AwardListService) => {
    expect(service).toBeTruthy();
  }));
});
