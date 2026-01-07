/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ExtendedProjectRelationSummaryComponent } from './extended-project-relation-summary.component';

describe('ExtendedProjectRelationSummaryComponent', () => {
    let component: ExtendedProjectRelationSummaryComponent;
    let fixture: ComponentFixture<ExtendedProjectRelationSummaryComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ExtendedProjectRelationSummaryComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ExtendedProjectRelationSummaryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
