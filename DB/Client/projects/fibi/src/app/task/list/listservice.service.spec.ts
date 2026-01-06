import { TestBed, inject } from '@angular/core/testing';

import { ListserviceService } from './listservice.service';

describe('ListserviceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ListserviceService]
    });
  });

  it('should be created', inject([ListserviceService], (service: ListserviceService) => {
    expect(service).toBeTruthy();
  }));
});
