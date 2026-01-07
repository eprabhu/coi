import { TestBed, inject } from '@angular/core/testing';

import { PersonMaintenanceService } from './person-maintenance.service';

describe('PersonMaintenanceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PersonMaintenanceService]
    });
  });

  it('should be created', inject([PersonMaintenanceService], (service: PersonMaintenanceService) => {
    expect(service).toBeTruthy();
  }));
});
