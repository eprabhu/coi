/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { KeyPersonComponent } from './key-person.component';

describe('KeyPersonComponent', () => {
  let component: KeyPersonComponent;
  let fixture: ComponentFixture<KeyPersonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KeyPersonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KeyPersonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
