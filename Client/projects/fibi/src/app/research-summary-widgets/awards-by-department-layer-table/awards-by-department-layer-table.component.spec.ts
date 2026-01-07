/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AwardsByDepartmentLayerTableComponent } from './awards-by-department-layer-table.component';

describe('AwardsByDepartmentLayerTableComponent', () => {
  let component: AwardsByDepartmentLayerTableComponent;
  let fixture: ComponentFixture<AwardsByDepartmentLayerTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AwardsByDepartmentLayerTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AwardsByDepartmentLayerTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
