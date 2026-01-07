import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressReportListComponent } from './progress-report-list.component';

describe('ProgressReportListComponent', () => {
  let component: ProgressReportListComponent;
  let fixture: ComponentFixture<ProgressReportListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgressReportListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressReportListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
