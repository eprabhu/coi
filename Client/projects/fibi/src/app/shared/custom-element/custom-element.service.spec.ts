import { TestBed, inject } from '@angular/core/testing';

import { CustomElementService } from './custom-element.service';

describe('CustomElementService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CustomElementService]
    });
  });

  it('should be created', inject([CustomElementService], (service: CustomElementService) => {
    expect(service).toBeTruthy();
  }));
});
