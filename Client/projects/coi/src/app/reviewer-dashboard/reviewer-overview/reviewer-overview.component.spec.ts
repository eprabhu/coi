/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ReviewerOverviewComponent } from './reviewer-overview.component';

describe('ReviewerOverviewComponent', () => {
    let component: ReviewerOverviewComponent;
    let fixture: ComponentFixture<ReviewerOverviewComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ReviewerOverviewComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ReviewerOverviewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
