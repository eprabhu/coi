/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PersonNotificationHistoryComponent } from './person-notification-history.component';

describe('PersonNotificationHistoryComponent', () => {
    let component: PersonNotificationHistoryComponent;
    let fixture: ComponentFixture<PersonNotificationHistoryComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [PersonNotificationHistoryComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PersonNotificationHistoryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
