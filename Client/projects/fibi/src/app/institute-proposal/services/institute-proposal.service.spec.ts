import { TestBed, inject } from '@angular/core/testing';

import { InstituteProposalService } from './institute-proposal.service';

describe('InstituteProposalService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InstituteProposalService]
    });
  });

  it('should be created', inject([InstituteProposalService], (service: InstituteProposalService) => {
    expect(service).toBeTruthy();
  }));
});
