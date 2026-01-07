/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AwardBySponsorTypesPiechartComponent } from './award-by-sponsor-types-piechart.component';

describe('AwardBySponsorTypesPiechartComponent', () => {
  let component: AwardBySponsorTypesPiechartComponent;
  let fixture: ComponentFixture<AwardBySponsorTypesPiechartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AwardBySponsorTypesPiechartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AwardBySponsorTypesPiechartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
