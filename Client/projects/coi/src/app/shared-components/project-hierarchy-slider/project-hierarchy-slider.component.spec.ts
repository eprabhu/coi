/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ProjectHierarchySliderComponent } from './project-hierarchy-slider.component';

describe('ProjectHierarchySliderComponent', () => {
    let component: ProjectHierarchySliderComponent;
    let fixture: ComponentFixture<ProjectHierarchySliderComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ProjectHierarchySliderComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectHierarchySliderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
