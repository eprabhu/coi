/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { LinkComplianceSpecialReviewComponent } from './link-compliance-special-review.component';

describe('LinkComplianceSpecialReviewComponent', () => {
  let component: LinkComplianceSpecialReviewComponent;
  let fixture: ComponentFixture<LinkComplianceSpecialReviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinkComplianceSpecialReviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkComplianceSpecialReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
