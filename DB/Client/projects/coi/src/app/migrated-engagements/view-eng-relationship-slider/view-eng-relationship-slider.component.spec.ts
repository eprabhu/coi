/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ViewEngRelationshipSliderComponent } from './view-eng-relationship-slider.component';

describe('ViewEngRelationshipSliderComponent', () => {
  let component: ViewEngRelationshipSliderComponent;
  let fixture: ComponentFixture<ViewEngRelationshipSliderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewEngRelationshipSliderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewEngRelationshipSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
