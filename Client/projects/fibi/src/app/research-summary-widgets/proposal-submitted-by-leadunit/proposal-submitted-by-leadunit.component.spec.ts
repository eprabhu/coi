/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ProposalSubmittedByLeadunitComponent } from './proposal-submitted-by-leadunit.component';

describe('ProposalSubmittedByLeadunitComponent', () => {
  let component: ProposalSubmittedByLeadunitComponent;
  let fixture: ComponentFixture<ProposalSubmittedByLeadunitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProposalSubmittedByLeadunitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProposalSubmittedByLeadunitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
