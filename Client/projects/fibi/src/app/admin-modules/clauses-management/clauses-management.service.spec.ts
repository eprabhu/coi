import { TestBed, inject } from '@angular/core/testing';

import { ClausesManagementService } from './clauses-management.service';

describe('ClausesManagementService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClausesManagementService]
    });
  });

  it('should be created', inject([ClausesManagementService], (service: ClausesManagementService) => {
    expect(service).toBeTruthy();
  }));
});
