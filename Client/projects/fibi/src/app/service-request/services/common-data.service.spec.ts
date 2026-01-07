/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CommonDataService } from './common-data.service';

describe('Service: CommonData', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CommonDataService]
    });
  });

  it('should ...', inject([CommonDataService], (service: CommonDataService) => {
    expect(service).toBeTruthy();
  }));
});
