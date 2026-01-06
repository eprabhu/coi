import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PendingProposalsAndAwardsBySponsorComponent } from './Pending-Proposals-and-Awards-by-Sponsor.component';

describe('PendingProposalsAndAwardsBySponsorComponent', () => {
  let component: PendingProposalsAndAwardsBySponsorComponent;
  let fixture: ComponentFixture<PendingProposalsAndAwardsBySponsorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PendingProposalsAndAwardsBySponsorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingProposalsAndAwardsBySponsorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
