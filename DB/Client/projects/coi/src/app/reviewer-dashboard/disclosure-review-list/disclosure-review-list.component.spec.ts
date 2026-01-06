/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { DisclosureReviewListComponent } from './disclosure-review-list.component';

describe('DisclosureReviewListComponent', () => {
    let component: DisclosureReviewListComponent;
    let fixture: ComponentFixture<DisclosureReviewListComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DisclosureReviewListComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DisclosureReviewListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
