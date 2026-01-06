/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { OutcomeResolverService } from './outcome-resolver.service';

describe('Service: OutcomeResolver', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OutcomeResolverService]
    });
  });

  it('should ...', inject([OutcomeResolverService], (service: OutcomeResolverService) => {
    expect(service).toBeTruthy();
  }));
});
