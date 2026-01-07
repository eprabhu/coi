/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CurrentPendingService } from './current-pending.service';

describe('Service: CurrentPending', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CurrentPendingService]
    });
  });

  it('should ...', inject([CurrentPendingService], (service: CurrentPendingService) => {
    expect(service).toBeTruthy();
  }));
});
