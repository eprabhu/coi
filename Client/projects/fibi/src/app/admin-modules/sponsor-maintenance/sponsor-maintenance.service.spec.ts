/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SponsorMaintenanceService } from './sponsor-maintenance.service';

describe('Service: SponsorMaintenance', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SponsorMaintenanceService]
    });
  });

  it('should ...', inject([SponsorMaintenanceService], (service: SponsorMaintenanceService) => {
    expect(service).toBeTruthy();
  }));
});
