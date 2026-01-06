/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CostSharingService } from './cost-sharing.service';

describe('Service: CostSharing', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CostSharingService]
    });
  });

  it('should ...', inject([CostSharingService], (service: CostSharingService) => {
    expect(service).toBeTruthy();
  }));
});
