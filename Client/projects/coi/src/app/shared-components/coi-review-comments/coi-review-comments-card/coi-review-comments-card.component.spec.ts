/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CoiReviewCommentsCardComponent } from './coi-review-comments-card.component';

describe('CoiReviewCommentsCardComponent', () => {
    let component: CoiReviewCommentsCardComponent;
    let fixture: ComponentFixture<CoiReviewCommentsCardComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CoiReviewCommentsCardComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CoiReviewCommentsCardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
