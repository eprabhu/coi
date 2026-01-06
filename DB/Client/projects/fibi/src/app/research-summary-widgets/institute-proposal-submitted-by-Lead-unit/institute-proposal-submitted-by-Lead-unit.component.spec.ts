/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { InstituteProposalSubmittedByLeadUnitComponent } from './institute-proposal-submitted-by-Lead-unit.component';

describe('InstituteProposalSubmittedByLeadUnitComponent', () => {
  let component: InstituteProposalSubmittedByLeadUnitComponent;
  let fixture: ComponentFixture<InstituteProposalSubmittedByLeadUnitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InstituteProposalSubmittedByLeadUnitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InstituteProposalSubmittedByLeadUnitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
