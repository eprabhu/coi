/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ProjectOutcomeService } from './project-outcome.service';

describe('Service: ProjectOutcome', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProjectOutcomeService]
    });
  });

  it('should ...', inject([ProjectOutcomeService], (service: ProjectOutcomeService) => {
    expect(service).toBeTruthy();
  }));
});
