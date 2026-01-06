import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressReportKpiForm1Component } from './progress-report-kpi-form1.component';

describe('ProgressReportKpiForm1Component', () => {
  let component: ProgressReportKpiForm1Component;
  let fixture: ComponentFixture<ProgressReportKpiForm1Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgressReportKpiForm1Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressReportKpiForm1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
