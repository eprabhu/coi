/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { CoiEntityComparisonSponsorComponent } from './coi-entity-comparison-sponsor.component';


describe('CoiEntityComparisonSponsorComponent', () => {
    let component: CoiEntityComparisonSponsorComponent;
    let fixture: ComponentFixture<CoiEntityComparisonSponsorComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CoiEntityComparisonSponsorComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CoiEntityComparisonSponsorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
