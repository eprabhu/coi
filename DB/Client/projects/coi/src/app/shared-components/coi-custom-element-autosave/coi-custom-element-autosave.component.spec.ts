/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CoiCustomElementAutosaveComponent } from './coi-custom-element-autosave.component';

describe('CoiCustomElementAutosaveComponent', () => {
  let component: CoiCustomElementAutosaveComponent;
  let fixture: ComponentFixture<CoiCustomElementAutosaveComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoiCustomElementAutosaveComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoiCustomElementAutosaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
