import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDashboardCardComponent } from './project-dashboard-card.component';

describe('ProjectDashboardCardComponent', () => {
  let component: ProjectDashboardCardComponent;
  let fixture: ComponentFixture<ProjectDashboardCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectDashboardCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectDashboardCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
