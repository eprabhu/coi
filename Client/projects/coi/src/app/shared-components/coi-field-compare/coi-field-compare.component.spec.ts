/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CoiFieldCompareComponent } from './coi-field-compare.component';

describe('CoiFieldCompareComponent', () => {
    let component: CoiFieldCompareComponent;
    let fixture: ComponentFixture<CoiFieldCompareComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CoiFieldCompareComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CoiFieldCompareComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
