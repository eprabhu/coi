/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EntityBatchReviewSliderComponent } from './entity-batch-review-slider.component';

describe('EntityBatchReviewSliderComponent', () => {
  let component: EntityBatchReviewSliderComponent;
  let fixture: ComponentFixture<EntityBatchReviewSliderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntityBatchReviewSliderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityBatchReviewSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
