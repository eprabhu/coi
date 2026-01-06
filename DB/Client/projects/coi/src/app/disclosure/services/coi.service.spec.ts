/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CoiService } from './coi.service';

describe('Service: Coi', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CoiService]
    });
  });

  it('should ...', inject([CoiService], (service: CoiService) => {
    expect(service).toBeTruthy();
  }));
});
