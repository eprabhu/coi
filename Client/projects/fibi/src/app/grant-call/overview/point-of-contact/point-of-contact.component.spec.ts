/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PointOfContactComponent } from './point-of-contact.component';

describe('PointOfContactComponent', () => {
  let component: PointOfContactComponent;
  let fixture: ComponentFixture<PointOfContactComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PointOfContactComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PointOfContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
