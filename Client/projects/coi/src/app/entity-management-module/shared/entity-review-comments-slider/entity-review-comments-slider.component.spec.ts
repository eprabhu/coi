/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EntityReviewCommentsSliderComponent } from './entity-review-comments-slider.component';

describe('EntityReviewCommentsSliderComponent', () => {
    let component: EntityReviewCommentsSliderComponent;
    let fixture: ComponentFixture<EntityReviewCommentsSliderComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EntityReviewCommentsSliderComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EntityReviewCommentsSliderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
