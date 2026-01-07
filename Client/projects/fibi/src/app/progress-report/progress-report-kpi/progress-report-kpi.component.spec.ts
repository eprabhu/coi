import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressReportKpiComponent } from './progress-report-kpi.component';

describe('ProgressReportKpiComponent', () => {
  let component: ProgressReportKpiComponent;
  let fixture: ComponentFixture<ProgressReportKpiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgressReportKpiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressReportKpiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
