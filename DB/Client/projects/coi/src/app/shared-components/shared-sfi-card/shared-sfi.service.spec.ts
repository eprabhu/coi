/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SharedSfiService } from './shared-sfi.service';

describe('Service: SharedSfi', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SharedSfiService]
    });
  });

  it('should ...', inject([SharedSfiService], (service: SharedSfiService) => {
    expect(service).toBeTruthy();
  }));
});
