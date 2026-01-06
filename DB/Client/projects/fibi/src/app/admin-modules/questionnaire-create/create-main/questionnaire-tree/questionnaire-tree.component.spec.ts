import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionnaireTreeComponent } from './questionnaire-tree.component';

describe('QuestionnaireTreeComponent', () => {
  let component: QuestionnaireTreeComponent;
  let fixture: ComponentFixture<QuestionnaireTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionnaireTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionnaireTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
