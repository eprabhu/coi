import { TestBed, inject } from '@angular/core/testing';

import { UnitHierarchyService } from './unit-hierarchy.service';

describe('UnitHierarchyService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UnitHierarchyService]
    });
  });

  it('should be created', inject([UnitHierarchyService], (service: UnitHierarchyService) => {
    expect(service).toBeTruthy();
  }));
});
