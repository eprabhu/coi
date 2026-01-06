/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CoiSectionCardComponent } from './coi-section-card.component';

describe('CoiSectionCardComponent', () => {
    let component: CoiSectionCardComponent;
    let fixture: ComponentFixture<CoiSectionCardComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CoiSectionCardComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CoiSectionCardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
