/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CoiEntityComparisonSliderComponent } from './coi-entity-comparison-slider.component';

describe('CoiEntityComparisonSliderComponent', () => {
    let component: CoiEntityComparisonSliderComponent;
    let fixture: ComponentFixture<CoiEntityComparisonSliderComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CoiEntityComparisonSliderComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CoiEntityComparisonSliderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
