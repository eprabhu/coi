/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SponsorHierarchyService } from './sponsor-hierarchy.service';

describe('Service: SponsorHierarchy', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SponsorHierarchyService]
    });
  });

  it('should ...', inject([SponsorHierarchyService], (service: SponsorHierarchyService) => {
    expect(service).toBeTruthy();
  }));
});
