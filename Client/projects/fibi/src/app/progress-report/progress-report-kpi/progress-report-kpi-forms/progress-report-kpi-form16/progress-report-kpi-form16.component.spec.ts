/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ProgressReportKpiForm16Component } from './progress-report-kpi-form16.component';

describe('ProgressReportKpiForm16Component', () => {
  let component: ProgressReportKpiForm16Component;
  let fixture: ComponentFixture<ProgressReportKpiForm16Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgressReportKpiForm16Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressReportKpiForm16Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
