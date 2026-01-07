/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PersonEligibilityAdditionModalComponent } from './person-eligibility-addition-modal.component';

describe('PersonEligibilityAdditionModalComponent', () => {
    let component: PersonEligibilityAdditionModalComponent;
    let fixture: ComponentFixture<PersonEligibilityAdditionModalComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [PersonEligibilityAdditionModalComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PersonEligibilityAdditionModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
