/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ProposalListService } from './proposal-list.service';

describe('Service: ProposalList', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProposalListService]
    });
  });

  it('should ...', inject([ProposalListService], (service: ProposalListService) => {
    expect(service).toBeTruthy();
  }));
});
