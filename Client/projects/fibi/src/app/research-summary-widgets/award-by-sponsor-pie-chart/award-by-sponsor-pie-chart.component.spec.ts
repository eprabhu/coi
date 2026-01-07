/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AwardBySponsorPieChartComponent } from './award-by-sponsor-pie-chart.component';

describe('AwardBySponsorPieChartComponent', () => {
  let component: AwardBySponsorPieChartComponent;
  let fixture: ComponentFixture<AwardBySponsorPieChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AwardBySponsorPieChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AwardBySponsorPieChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
