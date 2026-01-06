/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { GrantCommonDataService } from './grant-common-data.service';

describe('Service: GrantCommonData', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GrantCommonDataService]
    });
  });

  it('should ...', inject([GrantCommonDataService], (service: GrantCommonDataService) => {
    expect(service).toBeTruthy();
  }));
});
