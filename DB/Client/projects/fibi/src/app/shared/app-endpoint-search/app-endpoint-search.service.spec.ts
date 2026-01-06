/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AppEndpointSearchService } from './app-endpoint-search.service';

describe('Service: AppEndpointSearch', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppEndpointSearchService]
    });
  });

  it('should ...', inject([AppEndpointSearchService], (service: AppEndpointSearchService) => {
    expect(service).toBeTruthy();
  }));
});
