/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { DataLayerComponent } from './data-layer.component';

describe('DataLayerComponent', () => {
  let component: DataLayerComponent;
  let fixture: ComponentFixture<DataLayerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataLayerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
