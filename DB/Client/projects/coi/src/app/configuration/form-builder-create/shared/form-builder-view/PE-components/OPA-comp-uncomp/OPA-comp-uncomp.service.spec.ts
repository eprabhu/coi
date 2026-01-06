/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { OPACompUncompService } from './OPA-comp-uncomp.service';

describe('Service: OPACompUncomp', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OPACompUncompService]
    });
  });

  it('should ...', inject([OPACompUncompService], (service: OPACompUncompService) => {
    expect(service).toBeTruthy();
  }));
});
