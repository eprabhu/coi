/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { HelpGuideComponent } from './help-guide.component';

describe('HelpGuideComponent', () => {
    let component: HelpGuideComponent;
    let fixture: ComponentFixture<HelpGuideComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [HelpGuideComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HelpGuideComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
