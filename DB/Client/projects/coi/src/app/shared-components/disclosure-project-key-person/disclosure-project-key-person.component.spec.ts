/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { DisclosureProjectKeyPersonComponent } from './disclosure-project-key-person.component';

describe('DisclosureProjectKeyPersonComponent', () => {
    let component: DisclosureProjectKeyPersonComponent;
    let fixture: ComponentFixture<DisclosureProjectKeyPersonComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DisclosureProjectKeyPersonComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DisclosureProjectKeyPersonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
