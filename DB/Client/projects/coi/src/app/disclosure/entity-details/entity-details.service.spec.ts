/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { EntityDetailsService } from './entity-details.service';

describe('Service: EntityDetails', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EntityDetailsService]
    });
  });

  it('should ...', inject([EntityDetailsService], (service: EntityDetailsService) => {
    expect(service).toBeTruthy();
  }));
});
