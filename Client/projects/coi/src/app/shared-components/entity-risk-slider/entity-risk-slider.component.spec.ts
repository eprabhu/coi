/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { EntityRiskSliderComponent } from './entity-risk-slider.component';


describe('EntityRiskSliderComponent', () => {
  let component: EntityRiskSliderComponent;
  let fixture: ComponentFixture<EntityRiskSliderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntityRiskSliderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityRiskSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
