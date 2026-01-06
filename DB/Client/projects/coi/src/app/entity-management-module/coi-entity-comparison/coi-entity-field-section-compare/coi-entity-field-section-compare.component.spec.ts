/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CoiEntityFieldSectionCompareComponent } from './coi-entity-field-section-compare.component';

describe('CoiEntityFieldSectionCompareComponent', () => {
    let component: CoiEntityFieldSectionCompareComponent;
    let fixture: ComponentFixture<CoiEntityFieldSectionCompareComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CoiEntityFieldSectionCompareComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CoiEntityFieldSectionCompareComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
