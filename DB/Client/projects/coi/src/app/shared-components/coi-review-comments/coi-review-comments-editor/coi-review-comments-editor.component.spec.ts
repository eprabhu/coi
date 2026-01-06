/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CoiReviewCommentsEditorComponent } from './coi-review-comments-editor.component';

describe('CoiReviewCommentsEditorComponent', () => {
    let component: CoiReviewCommentsEditorComponent;
    let fixture: ComponentFixture<CoiReviewCommentsEditorComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CoiReviewCommentsEditorComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CoiReviewCommentsEditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
