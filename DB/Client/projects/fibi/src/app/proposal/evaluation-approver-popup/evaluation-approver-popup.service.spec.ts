/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { EvaluationApproverPopupService } from './evaluation-approver-popup.service';

describe('Service: EvaluationApproverPopup', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EvaluationApproverPopupService]
    });
  });

  it('should ...', inject([EvaluationApproverPopupService], (service: EvaluationApproverPopupService) => {
    expect(service).toBeTruthy();
  }));
});
