/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SharedEntireDisclosureHistoryComponent } from './shared-entire-disclosure-history.component';

describe('SharedEntireDisclosureHistoryComponent', () => {
    let component: SharedEntireDisclosureHistoryComponent;
    let fixture: ComponentFixture<SharedEntireDisclosureHistoryComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SharedEntireDisclosureHistoryComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SharedEntireDisclosureHistoryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
