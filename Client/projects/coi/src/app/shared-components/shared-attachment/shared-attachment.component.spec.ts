/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SharedAttachmentComponent } from './shared-attachment.component';

describe('SharedAttachmentComponent', () => {
    let component: SharedAttachmentComponent;
    let fixture: ComponentFixture<SharedAttachmentComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [SharedAttachmentComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SharedAttachmentComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
