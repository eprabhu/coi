import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressReportKpiForm11Component } from './progress-report-kpi-form11.component';

describe('ProgressReportKpiForm11Component', () => {
  let component: ProgressReportKpiForm11Component;
  let fixture: ComponentFixture<ProgressReportKpiForm11Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgressReportKpiForm11Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressReportKpiForm11Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
