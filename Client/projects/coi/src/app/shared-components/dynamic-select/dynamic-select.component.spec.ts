/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { DynamicSelectComponent } from './dynamic-select.component';

describe('DynamicSelectComponent', () => {
    let component: DynamicSelectComponent;
    let fixture: ComponentFixture<DynamicSelectComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DynamicSelectComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DynamicSelectComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
