/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { GeneralDetailsService } from './general-details.service';

describe('Service: GeneralDetails', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GeneralDetailsService]
    });
  });

  it('should ...', inject([GeneralDetailsService], (service: GeneralDetailsService) => {
    expect(service).toBeTruthy();
  }));
});
