/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ProgressReportKpiForm13Component } from './progress-report-kpi-form13.component';

describe('ProgressReportKpiForm13Component', () => {
  let component: ProgressReportKpiForm13Component;
  let fixture: ComponentFixture<ProgressReportKpiForm13Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgressReportKpiForm13Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressReportKpiForm13Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
