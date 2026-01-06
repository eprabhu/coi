/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { InstituteProposalBySponsorComponent } from './institute-proposal-by-sponsor.component';

describe('InstituteProposalBySponsorComponent', () => {
  let component: InstituteProposalBySponsorComponent;
  let fixture: ComponentFixture<InstituteProposalBySponsorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InstituteProposalBySponsorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InstituteProposalBySponsorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
