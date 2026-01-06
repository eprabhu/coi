/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { EntityRiskSectionComponent } from './entity-risk-section.component';


describe('EntityRiskSectionComponent', () => {
    let component: EntityRiskSectionComponent;
    let fixture: ComponentFixture<EntityRiskSectionComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [EntityRiskSectionComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(EntityRiskSectionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
