/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ConfigurationModalComponent } from './configuration-modal.component';

describe('ConfigurationModalComponent', () => {
    let component: ConfigurationModalComponent;
    let fixture: ComponentFixture<ConfigurationModalComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ConfigurationModalComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ConfigurationModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
