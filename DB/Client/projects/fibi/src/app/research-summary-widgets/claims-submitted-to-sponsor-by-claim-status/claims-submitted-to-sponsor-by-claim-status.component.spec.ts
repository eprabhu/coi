import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimsSubmittedToSponsorByClaimStatusComponent } from './claims-submitted-to-sponsor-by-claim-status.component';

describe('ClaimsSubmittedToSponsorByClaimStatusComponent', () => {
  let component: ClaimsSubmittedToSponsorByClaimStatusComponent;
  let fixture: ComponentFixture<ClaimsSubmittedToSponsorByClaimStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClaimsSubmittedToSponsorByClaimStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClaimsSubmittedToSponsorByClaimStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
