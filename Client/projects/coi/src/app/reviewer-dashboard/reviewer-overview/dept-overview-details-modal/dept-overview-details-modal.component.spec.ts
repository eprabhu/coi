/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { DeptOverviewDetailsModalComponent } from './dept-overview-details-modal.component';

describe('DeptOverviewDetailsModalComponent', () => {
    let component: DeptOverviewDetailsModalComponent;
    let fixture: ComponentFixture<DeptOverviewDetailsModalComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DeptOverviewDetailsModalComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DeptOverviewDetailsModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
