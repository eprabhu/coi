/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CoiReviewCommentsComponent } from './coi-review-comments.component';

describe('CoiReviewCommentsComponent', () => {
    let component: CoiReviewCommentsComponent;
    let fixture: ComponentFixture<CoiReviewCommentsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CoiReviewCommentsComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CoiReviewCommentsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
