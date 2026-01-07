/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CoiEntityComparisonRightNavComponent } from './coi-entity-comparison-right-nav.component';

describe('CoiEntityComparisonRightNavComponent', () => {
    let component: CoiEntityComparisonRightNavComponent;
    let fixture: ComponentFixture<CoiEntityComparisonRightNavComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CoiEntityComparisonRightNavComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CoiEntityComparisonRightNavComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
