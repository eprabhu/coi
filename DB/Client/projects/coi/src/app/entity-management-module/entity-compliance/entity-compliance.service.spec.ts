/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { EntityComplianceService } from './entity-compliance.service';

describe('Service: EntityCompliance', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EntityComplianceService]
    });
  });

  it('should ...', inject([EntityComplianceService], (service: EntityComplianceService) => {
    expect(service).toBeTruthy();
  }));
});
