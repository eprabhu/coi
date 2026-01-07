/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PlaceholderServiceService } from './placeholder-service.service';

describe('Service: PlaceholderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PlaceholderServiceService]
    });
  });

  it('should ...', inject([PlaceholderServiceService], (service: PlaceholderServiceService) => {
    expect(service).toBeTruthy();
  }));
});
