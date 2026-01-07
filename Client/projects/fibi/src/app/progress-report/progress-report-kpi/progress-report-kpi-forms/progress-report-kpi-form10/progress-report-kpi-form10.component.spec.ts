import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressReportKpiForm10Component } from './progress-report-kpi-form10.component';

describe('ProgressReportKpiForm10Component', () => {
  let component: ProgressReportKpiForm10Component;
  let fixture: ComponentFixture<ProgressReportKpiForm10Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgressReportKpiForm10Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressReportKpiForm10Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
