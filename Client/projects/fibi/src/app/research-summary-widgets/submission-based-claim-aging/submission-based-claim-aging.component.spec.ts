/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SubmissionBasedClaimAgingComponent } from './submission-based-claim-aging.component';

describe('SubmissionBasedClaimAgingComponent', () => {
  let component: SubmissionBasedClaimAgingComponent;
  let fixture: ComponentFixture<SubmissionBasedClaimAgingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubmissionBasedClaimAgingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmissionBasedClaimAgingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
