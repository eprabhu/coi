import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressReportKpiForm2Component } from './progress-report-kpi-form2.component';

describe('ProgressReportKpiForm2Component', () => {
  let component: ProgressReportKpiForm2Component;
  let fixture: ComponentFixture<ProgressReportKpiForm2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgressReportKpiForm2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressReportKpiForm2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
