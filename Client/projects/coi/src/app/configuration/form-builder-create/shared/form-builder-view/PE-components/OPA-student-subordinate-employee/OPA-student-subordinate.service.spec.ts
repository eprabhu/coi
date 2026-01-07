/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { OPAStudentSubordinateService } from './OPA-student-subordinate.service';

describe('Service: OPAStudentSubordinate', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OPAStudentSubordinateService]
    });
  });

  it('should ...', inject([OPAStudentSubordinateService], (service: OPAStudentSubordinateService) => {
    expect(service).toBeTruthy();
  }));
});
