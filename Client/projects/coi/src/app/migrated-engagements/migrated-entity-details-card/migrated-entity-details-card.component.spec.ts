/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MigratedEntityDetailsCardComponent } from './migrated-entity-details-card.component';

describe('MigratedEntityDetailsCardComponent', () => {
  let component: MigratedEntityDetailsCardComponent;
  let fixture: ComponentFixture<MigratedEntityDetailsCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MigratedEntityDetailsCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MigratedEntityDetailsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
