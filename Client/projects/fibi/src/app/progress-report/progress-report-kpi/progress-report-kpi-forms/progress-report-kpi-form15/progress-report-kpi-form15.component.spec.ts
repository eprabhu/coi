/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ProgressReportKpiForm15Component } from './progress-report-kpi-form15.component';

describe('ProgressReportKpiForm15Component', () => {
  let component: ProgressReportKpiForm15Component;
  let fixture: ComponentFixture<ProgressReportKpiForm15Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgressReportKpiForm15Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressReportKpiForm15Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
