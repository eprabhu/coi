import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressReportSummaryComponent } from './progress-report-summary.component';

describe('ProgressReportSummaryComponent', () => {
  let component: ProgressReportSummaryComponent;
  let fixture: ComponentFixture<ProgressReportSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgressReportSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressReportSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
