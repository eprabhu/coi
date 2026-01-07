/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SharedEntityCreationModalComponent } from './shared-entity-creation-modal.component';

describe('SharedEntityCreationModalComponent', () => {
    let component: SharedEntityCreationModalComponent;
    let fixture: ComponentFixture<SharedEntityCreationModalComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SharedEntityCreationModalComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SharedEntityCreationModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
