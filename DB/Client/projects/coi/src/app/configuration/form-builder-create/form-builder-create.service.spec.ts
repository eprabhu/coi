/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { FormBuilderCreateService } from './form-builder-create.service';

describe('Service: FormBuilderCreate', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FormBuilderCreateService]
    });
  });

  it('should ...', inject([FormBuilderCreateService], (service: FormBuilderCreateService) => {
    expect(service).toBeTruthy();
  }));
});
