/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { TriageService } from './triage.service';

describe('Service: Triage', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TriageService]
    });
  });

  it('should ...', inject([TriageService], (service: TriageService) => {
    expect(service).toBeTruthy();
  }));
});
