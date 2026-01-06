/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { UserCertificationHeaderComponent } from './user-declaration-header.component';

describe('UserCertificationHeaderComponent', () => {
    let component: UserCertificationHeaderComponent;
    let fixture: ComponentFixture<UserCertificationHeaderComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [UserCertificationHeaderComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(UserCertificationHeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
