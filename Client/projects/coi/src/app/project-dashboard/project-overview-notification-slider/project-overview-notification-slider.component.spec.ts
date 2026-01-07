/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ProjectOverviewNotificationSliderComponent } from './project-overview-notification-slider.component';

describe('ProjectOverviewNotificationSliderComponent', () => {
    let component: ProjectOverviewNotificationSliderComponent;
    let fixture: ComponentFixture<ProjectOverviewNotificationSliderComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ProjectOverviewNotificationSliderComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectOverviewNotificationSliderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
