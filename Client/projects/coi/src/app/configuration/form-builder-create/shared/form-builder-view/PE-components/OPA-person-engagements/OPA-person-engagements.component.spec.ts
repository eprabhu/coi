/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { OPAPersonEngagementsComponent } from './OPA-person-engagements.component';


describe('OPAPersonEngagementsComponent', () => {
    let component: OPAPersonEngagementsComponent;
    let fixture: ComponentFixture<OPAPersonEngagementsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [OPAPersonEngagementsComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(OPAPersonEngagementsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
