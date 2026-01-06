/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { KeyPerformanceIndicatorProposalComponent } from './key-performance-indicator-proposal.component';

describe('KeyPerformanceIndicatorProposalComponent', () => {
  let component: KeyPerformanceIndicatorProposalComponent;
  let fixture: ComponentFixture<KeyPerformanceIndicatorProposalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KeyPerformanceIndicatorProposalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KeyPerformanceIndicatorProposalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
