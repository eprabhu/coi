/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ScreeningQuestionnaireSummaryComponent } from './screening-questionnaire-summary.component';

describe('ScreeningQuestionnaireSummaryComponent', () => {
  let component: ScreeningQuestionnaireSummaryComponent;
  let fixture: ComponentFixture<ScreeningQuestionnaireSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScreeningQuestionnaireSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScreeningQuestionnaireSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
