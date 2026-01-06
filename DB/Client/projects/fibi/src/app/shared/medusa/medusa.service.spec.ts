import { TestBed, inject } from '@angular/core/testing';

import { MedusaService } from './medusa.service';

describe('MedusaService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MedusaService]
    });
  });

  it('should be created', inject([MedusaService], (service: MedusaService) => {
    expect(service).toBeTruthy();
  }));
});
