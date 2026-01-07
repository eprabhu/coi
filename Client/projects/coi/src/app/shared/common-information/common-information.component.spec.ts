/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CommonInformationComponent } from './common-information.component';

describe('CommonInformationComponent', () => {
    let component: CommonInformationComponent;
    let fixture: ComponentFixture<CommonInformationComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CommonInformationComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CommonInformationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
