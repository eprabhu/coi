import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InstituteProposalComponent } from './institute-proposal.component';

describe('InstituteProposalComponent', () => {
  let component: InstituteProposalComponent;
  let fixture: ComponentFixture<InstituteProposalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InstituteProposalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InstituteProposalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
