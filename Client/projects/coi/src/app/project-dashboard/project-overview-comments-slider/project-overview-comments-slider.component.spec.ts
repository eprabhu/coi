/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ProjectOverviewCommentsSliderComponent } from './project-overview-comments-slider.component';

describe('ProjectOverviewCommentsSliderComponent', () => {
    let component: ProjectOverviewCommentsSliderComponent;
    let fixture: ComponentFixture<ProjectOverviewCommentsSliderComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ProjectOverviewCommentsSliderComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectOverviewCommentsSliderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
