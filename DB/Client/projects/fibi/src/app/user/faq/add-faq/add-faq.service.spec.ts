/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { AddFaqService } from './add-faq.service';

describe('Service: AddFaq', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AddFaqService]
    });
  });

  it('should ...', inject([AddFaqService], (service: AddFaqService) => {
    expect(service).toBeTruthy();
  }));
});
