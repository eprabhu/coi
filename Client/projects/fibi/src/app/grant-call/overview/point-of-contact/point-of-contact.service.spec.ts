/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PointOfContactService } from './point-of-contact.service';

describe('Service: PointOfContact', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PointOfContactService]
    });
  });

  it('should ...', inject([PointOfContactService], (service: PointOfContactService) => {
    expect(service).toBeTruthy();
  }));
});
