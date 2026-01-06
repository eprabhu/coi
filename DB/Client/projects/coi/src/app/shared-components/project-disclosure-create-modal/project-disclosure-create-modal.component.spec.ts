/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ProjectDisclosureCreateModalComponent } from './project-disclosure-create-modal.component';

describe('ProjectDisclosureCreateModalComponent', () => {
    let component: ProjectDisclosureCreateModalComponent;
    let fixture: ComponentFixture<ProjectDisclosureCreateModalComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ProjectDisclosureCreateModalComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectDisclosureCreateModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
