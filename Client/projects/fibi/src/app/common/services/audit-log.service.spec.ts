/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AuditLogService } from './audit-log.service';

describe('Service: AuditLog', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuditLogService]
    });
  });

  it('should ...', inject([AuditLogService], (service: AuditLogService) => {
    expect(service).toBeTruthy();
  }));
});
