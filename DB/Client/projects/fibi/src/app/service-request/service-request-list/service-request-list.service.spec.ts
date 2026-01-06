/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ServiceRequestListService } from './service-request-list.service';

describe('Service: ServiceRequestList', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ServiceRequestListService]
    });
  });

  it('should ...', inject([ServiceRequestListService], (service: ServiceRequestListService) => {
    expect(service).toBeTruthy();
  }));
});
