/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ProjectMandatoryHistorySliderComponent } from './project-mandatory-history-slider.component';

describe('ProjectMandatoryHistorySliderComponent', () => {
    let component: ProjectMandatoryHistorySliderComponent;
    let fixture: ComponentFixture<ProjectMandatoryHistorySliderComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ProjectMandatoryHistorySliderComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectMandatoryHistorySliderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
