/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ProgressReportKpiForm12Component } from './progress-report-kpi-form12.component';

describe('ProgressReportKpiForm12Component', () => {
  let component: ProgressReportKpiForm12Component;
  let fixture: ComponentFixture<ProgressReportKpiForm12Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgressReportKpiForm12Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressReportKpiForm12Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
