import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressReportDetailsComponent } from './progress-report-details.component';

describe('ProgressReportDetailsComponent', () => {
  let component: ProgressReportDetailsComponent;
  let fixture: ComponentFixture<ProgressReportDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgressReportDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressReportDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
