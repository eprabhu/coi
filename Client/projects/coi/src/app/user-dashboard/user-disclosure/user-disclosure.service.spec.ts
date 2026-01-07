import { TestBed } from '@angular/core/testing';

import { UserDisclosureService } from './user-disclosure.service';

describe('UserDisclosureService', () => {
  let service: UserDisclosureService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserDisclosureService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
