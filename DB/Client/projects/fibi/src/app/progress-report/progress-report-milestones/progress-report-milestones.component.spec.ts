import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressReportMilestonesComponent } from './progress-report-milestones.component';

describe('ProgressReportMilestonesComponent', () => {
  let component: ProgressReportMilestonesComponent;
  let fixture: ComponentFixture<ProgressReportMilestonesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgressReportMilestonesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressReportMilestonesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
