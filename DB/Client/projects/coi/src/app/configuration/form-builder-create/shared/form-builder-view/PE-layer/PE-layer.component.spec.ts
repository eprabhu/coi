/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PELayerComponent } from './PE-layer.component';

describe('PELayerComponent', () => {
  let component: PELayerComponent;
  let fixture: ComponentFixture<PELayerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PELayerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PELayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
