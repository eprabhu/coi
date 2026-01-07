import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProposalScoringComponent } from './proposal-scoring.component';

describe('ProposalScoringComponent', () => {
  let component: ProposalScoringComponent;
  let fixture: ComponentFixture<ProposalScoringComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProposalScoringComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProposalScoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
