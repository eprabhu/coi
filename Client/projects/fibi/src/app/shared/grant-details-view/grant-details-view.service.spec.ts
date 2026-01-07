import { TestBed, inject } from '@angular/core/testing';

import { GrantDetailsViewService } from './grant-details-view.service';

describe('GrantDetailsViewService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GrantDetailsViewService]
    });
  });

  it('should be created', inject([GrantDetailsViewService], (service: GrantDetailsViewService) => {
    expect(service).toBeTruthy();
  }));
});
