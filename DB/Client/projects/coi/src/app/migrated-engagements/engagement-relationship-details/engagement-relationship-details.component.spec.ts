/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EngagementRelationshipDetailsComponent } from './engagement-relationship-details.component';

describe('EngagementRelationshipDetailsComponent', () => {
    let component: EngagementRelationshipDetailsComponent;
    let fixture: ComponentFixture<EngagementRelationshipDetailsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EngagementRelationshipDetailsComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EngagementRelationshipDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
