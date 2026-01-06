import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressReportOverviewComponent } from './progress-report-overview.component';

describe('ProgressReportOverviewComponent', () => {
  let component: ProgressReportOverviewComponent;
  let fixture: ComponentFixture<ProgressReportOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgressReportOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressReportOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
