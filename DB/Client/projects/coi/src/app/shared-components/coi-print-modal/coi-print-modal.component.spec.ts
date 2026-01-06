/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CoiPrintModalComponent } from './coi-print-modal.component';

describe('CoiPrintModalComponent', () => {
    let component: CoiPrintModalComponent;
    let fixture: ComponentFixture<CoiPrintModalComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CoiPrintModalComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CoiPrintModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
