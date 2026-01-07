import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportingRequirementDetailsComponent } from './reporting-requirement-details.component';

describe('ReportingRequirementDetailsComponent', () => {
  let component: ReportingRequirementDetailsComponent;
  let fixture: ComponentFixture<ReportingRequirementDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportingRequirementDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportingRequirementDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
