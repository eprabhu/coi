/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ResearchSummaryDailyCheckComponent } from './research-summary-daily-check.component';

describe('ResearchSummaryDailyCheckComponent', () => {
  let component: ResearchSummaryDailyCheckComponent;
  let fixture: ComponentFixture<ResearchSummaryDailyCheckComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResearchSummaryDailyCheckComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResearchSummaryDailyCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
