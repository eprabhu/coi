/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { ExtendedProjectRelationshipSummaryComponent } from './extended-project-relationship-summary.component';


describe('ExtendedProjectRelationshipSummaryComponent', () => {
    let component: ExtendedProjectRelationshipSummaryComponent;
    let fixture: ComponentFixture<ExtendedProjectRelationshipSummaryComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ExtendedProjectRelationshipSummaryComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ExtendedProjectRelationshipSummaryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
