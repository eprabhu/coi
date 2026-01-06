/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { CoiEntityComparisonOverviewComponent } from './coi-entity-comparison-overview.component';

describe('CoiEntityComparisonOverviewComponent', () => {
  let component: CoiEntityComparisonOverviewComponent;
  let fixture: ComponentFixture<CoiEntityComparisonOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoiEntityComparisonOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoiEntityComparisonOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
