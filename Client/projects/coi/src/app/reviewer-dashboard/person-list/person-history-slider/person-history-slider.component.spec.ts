/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PersonHistorySliderComponent } from './person-history-slider.component';

describe('PersonHistorySliderComponent', () => {
  let component: PersonHistorySliderComponent;
  let fixture: ComponentFixture<PersonHistorySliderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PersonHistorySliderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonHistorySliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
