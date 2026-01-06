/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { QuestionnaireListService } from './questionnaire-list.service';

describe('Service: QuestionnaireList', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [QuestionnaireListService]
    });
  });

  it('should ...', inject([QuestionnaireListService], (service: QuestionnaireListService) => {
    expect(service).toBeTruthy();
  }));
});
