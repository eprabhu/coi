/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SharedRiskHistoryComponent } from './shared-risk-history.component';

describe('SharedRiskHistoryComponent', () => {
    let component: SharedRiskHistoryComponent;
    let fixture: ComponentFixture<SharedRiskHistoryComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SharedRiskHistoryComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SharedRiskHistoryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
