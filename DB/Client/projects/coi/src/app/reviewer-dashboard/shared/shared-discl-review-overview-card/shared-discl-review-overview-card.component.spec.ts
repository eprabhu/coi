/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SharedDisclReviewOverviewCardComponent } from './shared-discl-review-overview-card.component';

describe('SharedDisclReviewOverviewCardComponent', () => {
    let component: SharedDisclReviewOverviewCardComponent;
    let fixture: ComponentFixture<SharedDisclReviewOverviewCardComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SharedDisclReviewOverviewCardComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SharedDisclReviewOverviewCardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
