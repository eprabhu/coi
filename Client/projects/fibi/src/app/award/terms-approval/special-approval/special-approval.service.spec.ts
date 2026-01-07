/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { SpecialApprovalService } from './special-approval.service';

describe('Service: SpecialApproval', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SpecialApprovalService]
    });
  });

  it('should ...', inject([SpecialApprovalService], (service: SpecialApprovalService) => {
    expect(service).toBeTruthy();
  }));
});
