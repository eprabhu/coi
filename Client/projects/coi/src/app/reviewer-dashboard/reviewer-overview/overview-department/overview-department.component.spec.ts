/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { OverviewDepartmentComponent } from './overview-department.component';

describe('OverviewDepartmentComponent', () => {
    let component: OverviewDepartmentComponent;
    let fixture: ComponentFixture<OverviewDepartmentComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [OverviewDepartmentComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(OverviewDepartmentComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
