/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { QuestionnaireCompareService } from './questionnaire-compare.service';

describe('Service: QuestionnaireCompare', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [QuestionnaireCompareService]
    });
  });

  it('should ...', inject([QuestionnaireCompareService], (service: QuestionnaireCompareService) => {
    expect(service).toBeTruthy();
  }));
});
