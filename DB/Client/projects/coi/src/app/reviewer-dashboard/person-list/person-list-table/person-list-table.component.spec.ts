/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PersonListTableComponent } from './person-list-table.component';

describe('PersonListTableComponent', () => {
    let component: PersonListTableComponent;
    let fixture: ComponentFixture<PersonListTableComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [PersonListTableComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PersonListTableComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
