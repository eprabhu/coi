/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PersonRelatedSlidersComponent } from './person-related-sliders.component';

describe('PersonRelatedSlidersComponent', () => {
  let component: PersonRelatedSlidersComponent;
  let fixture: ComponentFixture<PersonRelatedSlidersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PersonRelatedSlidersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonRelatedSlidersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
