import { TestBed, inject } from '@angular/core/testing';

import { ProposalHomeService } from './proposal-home.service';

describe('ProposalHomeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProposalHomeService]
    });
  });

  it('should be created', inject([ProposalHomeService], (service: ProposalHomeService) => {
    expect(service).toBeTruthy();
  }));
});
