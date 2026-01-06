import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProposalHomeEditComponent } from './proposal-home-edit.component';

describe('ProposalHomeEditComponent', () => {
  let component: ProposalHomeEditComponent;
  let fixture: ComponentFixture<ProposalHomeEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProposalHomeEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProposalHomeEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
