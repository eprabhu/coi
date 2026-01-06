/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Person_details_modalService } from './person_details_modal.service';

describe('Service: Person_details_modal', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Person_details_modalService]
    });
  });

  it('should ...', inject([Person_details_modalService], (service: Person_details_modalService) => {
    expect(service).toBeTruthy();
  }));
});
