/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CommonForeignFlagComponent } from './common-foreign-flag.component';

describe('CommonForeignFlagComponent', () => {
    let component: CommonForeignFlagComponent;
    let fixture: ComponentFixture<CommonForeignFlagComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CommonForeignFlagComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CommonForeignFlagComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
