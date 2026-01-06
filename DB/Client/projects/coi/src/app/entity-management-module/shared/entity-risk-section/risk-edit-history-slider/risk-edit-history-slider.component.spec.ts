/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { RiskEditHistorySlider } from './risk-edit-history-slider.component';

describe('RiskEditHistorySlider', () => {
    let component: RiskEditHistorySlider;
    let fixture: ComponentFixture<RiskEditHistorySlider>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [RiskEditHistorySlider]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RiskEditHistorySlider);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
