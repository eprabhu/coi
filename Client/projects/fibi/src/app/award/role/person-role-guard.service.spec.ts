
import { TestBed, async, inject } from '@angular/core/testing';
import { PersonRoleResolveGuardService } from './person-role-guard.service';

describe('Service: PersonRoleResolver', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PersonRoleResolveGuardService]
    });
  });

  it('should ...', inject([PersonRoleResolveGuardService], (service: PersonRoleResolveGuardService) => {
    expect(service).toBeTruthy();
  }));
});
