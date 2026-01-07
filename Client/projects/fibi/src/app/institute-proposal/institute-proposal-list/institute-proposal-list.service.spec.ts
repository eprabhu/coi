/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { InstituteProposalListService } from './institute-proposal-list.service';

describe('Service: InstituteProposalList', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InstituteProposalListService]
    });
  });

  it('should ...', inject([InstituteProposalListService], (service: InstituteProposalListService) => {
    expect(service).toBeTruthy();
  }));
});
