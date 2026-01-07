import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingProposalBySponsorTypeComponent } from './pending-proposal-by-sponsor-type.component';

describe('PendingProposalBySponsorTypeComponent', () => {
  let component: PendingProposalBySponsorTypeComponent;
  let fixture: ComponentFixture<PendingProposalBySponsorTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PendingProposalBySponsorTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingProposalBySponsorTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
