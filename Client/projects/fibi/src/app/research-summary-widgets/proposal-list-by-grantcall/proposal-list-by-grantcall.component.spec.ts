/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ProposalListByGrantcallComponent } from './proposal-list-by-grantcall.component';

describe('ProposalListByGrantcallComponent', () => {
  let component: ProposalListByGrantcallComponent;
  let fixture: ComponentFixture<ProposalListByGrantcallComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProposalListByGrantcallComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProposalListByGrantcallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
