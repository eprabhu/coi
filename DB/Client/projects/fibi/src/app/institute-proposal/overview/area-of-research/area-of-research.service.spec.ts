/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AreaOfResearchService } from './area-of-research.service';

describe('Service: AreaOfResearch', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AreaOfResearchService]
    });
  });

  it('should ...', inject([AreaOfResearchService], (service: AreaOfResearchService) => {
    expect(service).toBeTruthy();
  }));
});
