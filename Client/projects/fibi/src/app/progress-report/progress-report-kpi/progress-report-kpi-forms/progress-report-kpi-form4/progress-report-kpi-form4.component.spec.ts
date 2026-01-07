import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressReportKpiForm4Component } from './progress-report-kpi-form4.component';

describe('ProgressReportKpiForm4Component', () => {
  let component: ProgressReportKpiForm4Component;
  let fixture: ComponentFixture<ProgressReportKpiForm4Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgressReportKpiForm4Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressReportKpiForm4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
