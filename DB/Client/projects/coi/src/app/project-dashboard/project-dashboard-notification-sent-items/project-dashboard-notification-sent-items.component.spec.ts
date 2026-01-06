import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDashboardNotificationSentItemsComponent } from './project-dashboard-notification-sent-items.component';

describe('ProjectDashboardNotificationSentItemsComponent', () => {
  let component: ProjectDashboardNotificationSentItemsComponent;
  let fixture: ComponentFixture<ProjectDashboardNotificationSentItemsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectDashboardNotificationSentItemsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectDashboardNotificationSentItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
