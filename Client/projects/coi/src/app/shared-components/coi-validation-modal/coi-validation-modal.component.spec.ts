/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CoiValidationModalComponent } from './coi-validation-modal.component';

describe('CoiValidationModalComponent', () => {
    let component: CoiValidationModalComponent;
    let fixture: ComponentFixture<CoiValidationModalComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CoiValidationModalComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CoiValidationModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
