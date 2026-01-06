import { TestBed, inject } from '@angular/core/testing';

import { CustomDataService } from './custom-data.service';

describe('CustomDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CustomDataService]
    });
  });

  it('should be created', inject([CustomDataService], (service: CustomDataService) => {
    expect(service).toBeTruthy();
  }));
});
