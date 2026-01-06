import { TestBed, inject } from '@angular/core/testing';

import { RolodexMaintenanceService } from './rolodex-maintenance.service';

describe('RolodexMaintenanceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RolodexMaintenanceService]
    });
  });

  it('should be created', inject([RolodexMaintenanceService], (service: RolodexMaintenanceService) => {
    expect(service).toBeTruthy();
  }));
});
