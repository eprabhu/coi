/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CoiReviewCommentsSliderComponent } from './coi-review-comments-slider.component';

describe('CoiReviewCommentsSliderComponent', () => {
    let component: CoiReviewCommentsSliderComponent;
    let fixture: ComponentFixture<CoiReviewCommentsSliderComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CoiReviewCommentsSliderComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CoiReviewCommentsSliderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
