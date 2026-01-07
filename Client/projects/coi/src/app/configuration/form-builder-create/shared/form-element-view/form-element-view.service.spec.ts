/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { FormElementViewService } from './form-element-view.service';

describe('Service: FormElementView', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FormElementViewService]
    });
  });

  it('should ...', inject([FormElementViewService], (service: FormElementViewService) => {
    expect(service).toBeTruthy();
  }));
});
