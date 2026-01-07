/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CoiEntityRiskComparisonComponent } from './coi-entity-risk-comparison.component';

describe('CoiEntityRiskComparisonComponent', () => {
    let component: CoiEntityRiskComparisonComponent;
    let fixture: ComponentFixture<CoiEntityRiskComparisonComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CoiEntityRiskComparisonComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CoiEntityRiskComparisonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
