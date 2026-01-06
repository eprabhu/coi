import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressReportKpiForm3Component } from './progress-report-kpi-form3.component';

describe('ProgressReportKpiForm3Component', () => {
  let component: ProgressReportKpiForm3Component;
  let fixture: ComponentFixture<ProgressReportKpiForm3Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgressReportKpiForm3Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressReportKpiForm3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
