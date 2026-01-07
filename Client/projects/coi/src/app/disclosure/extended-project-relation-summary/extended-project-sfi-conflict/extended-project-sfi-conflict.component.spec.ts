/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { ExtendedProjectSfiConflictComponent } from './extended-project-sfi-conflict.component';


describe('ExtendedProjectSfiConflictComponent', () => {
    let component: ExtendedProjectSfiConflictComponent;
    let fixture: ComponentFixture<ExtendedProjectSfiConflictComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ExtendedProjectSfiConflictComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ExtendedProjectSfiConflictComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
