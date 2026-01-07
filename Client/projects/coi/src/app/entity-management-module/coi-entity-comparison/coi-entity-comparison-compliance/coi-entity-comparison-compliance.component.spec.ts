/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { CoiEntityComparisonComplianceComponent } from './coi-entity-comparison-compliance.component';


describe('CoiEntityComparisonComplianceComponent', () => {
    let component: CoiEntityComparisonComplianceComponent;
    let fixture: ComponentFixture<CoiEntityComparisonComplianceComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CoiEntityComparisonComplianceComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CoiEntityComparisonComplianceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
