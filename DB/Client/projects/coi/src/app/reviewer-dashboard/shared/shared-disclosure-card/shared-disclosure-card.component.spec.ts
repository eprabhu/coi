/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SharedDisclosureCardComponent } from './shared-disclosure-card.component';

describe('SharedDisclosureCardComponent', () => {
    let component: SharedDisclosureCardComponent;
    let fixture: ComponentFixture<SharedDisclosureCardComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SharedDisclosureCardComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SharedDisclosureCardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
