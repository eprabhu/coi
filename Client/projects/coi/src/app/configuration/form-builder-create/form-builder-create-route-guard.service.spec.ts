/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { FormBuilderCreateRouteGaurdService } from './form-builder-create-route-guard.service';

describe('Service: FormBuilderCreateRouteGaurd', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FormBuilderCreateRouteGaurdService]
    });
  });

  it('should ...', inject([FormBuilderCreateRouteGaurdService], (service: FormBuilderCreateRouteGaurdService) => {
    expect(service).toBeTruthy();
  }));
});
