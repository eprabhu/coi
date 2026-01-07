/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PersonMaintenanceGuardService } from './person-maintenance-guard.service';

describe('Service: PersonMaintenanceGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PersonMaintenanceGuardService]
    });
  });

  it('should ...', inject([PersonMaintenanceGuardService], (service: PersonMaintenanceGuardService) => {
    expect(service).toBeTruthy();
  }));
});
