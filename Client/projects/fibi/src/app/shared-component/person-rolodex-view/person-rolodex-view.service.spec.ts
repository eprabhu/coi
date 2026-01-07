/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PersonRolodexViewService } from './person-rolodex-view.service';

describe('Service: RolodexView', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PersonRolodexViewService]
    });
  });

  it('should ...', inject([PersonRolodexViewService], (service: PersonRolodexViewService) => {
    expect(service).toBeTruthy();
  }));
});
