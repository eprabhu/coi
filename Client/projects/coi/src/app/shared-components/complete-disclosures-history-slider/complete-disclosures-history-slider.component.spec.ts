/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CompleteDisclosuresHistorySliderComponent } from './complete-disclosures-history-slider.component';

describe('CompleteDisclosuresHistorySliderComponent', () => {
    let component: CompleteDisclosuresHistorySliderComponent;
    let fixture: ComponentFixture<CompleteDisclosuresHistorySliderComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CompleteDisclosuresHistorySliderComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CompleteDisclosuresHistorySliderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
