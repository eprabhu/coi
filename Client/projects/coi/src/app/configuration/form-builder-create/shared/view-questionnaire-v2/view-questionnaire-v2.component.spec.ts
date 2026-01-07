/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ViewQuestionnaireV2Component } from './view-questionnaire-v2.component';

describe('ViewQuestionnaireV2Component', () => {
  let component: ViewQuestionnaireV2Component;
  let fixture: ComponentFixture<ViewQuestionnaireV2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewQuestionnaireV2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewQuestionnaireV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
