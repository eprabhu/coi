/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ToolKitComponent } from './tool-kit.component';

describe('ToolKitComponent', () => {
  let component: ToolKitComponent;
  let fixture: ComponentFixture<ToolKitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToolKitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolKitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
