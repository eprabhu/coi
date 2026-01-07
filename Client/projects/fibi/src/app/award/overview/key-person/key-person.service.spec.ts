import { TestBed, inject } from '@angular/core/testing';

import { KeyPersonService } from './key-person.service';

describe('KeyPersonService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KeyPersonService]
    });
  });

  it('should be created', inject([KeyPersonService], (service: KeyPersonService) => {
    expect(service).toBeTruthy();
  }));
});
