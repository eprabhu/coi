/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CommonHelpTextComponent } from './common-help-text.component';

describe('CommonHelpTextComponent', () => {
    let component: CommonHelpTextComponent;
    let fixture: ComponentFixture<CommonHelpTextComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CommonHelpTextComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CommonHelpTextComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
