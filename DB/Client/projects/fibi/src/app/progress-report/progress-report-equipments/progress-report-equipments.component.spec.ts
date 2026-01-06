import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressReportEquipmentsComponent } from './progress-report-equipments.component';

describe('ProgressReportEquipmentsComponent', () => {
  let component: ProgressReportEquipmentsComponent;
  let fixture: ComponentFixture<ProgressReportEquipmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgressReportEquipmentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressReportEquipmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
