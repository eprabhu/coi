/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CoiStepsNavigationComponent } from './coi-steps-navigation.component';

describe('CoiStepsNavigationComponent', () => {
    let component: CoiStepsNavigationComponent;
    let fixture: ComponentFixture<CoiStepsNavigationComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CoiStepsNavigationComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CoiStepsNavigationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
