/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { CoiEntityComparisonOrganizationComponent } from './coi-entity-comparison-organization.component';


describe('CoiEntityComparisonOrganizationComponent', () => {
    let component: CoiEntityComparisonOrganizationComponent;
    let fixture: ComponentFixture<CoiEntityComparisonOrganizationComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CoiEntityComparisonOrganizationComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CoiEntityComparisonOrganizationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
