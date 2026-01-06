import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProposalHomeViewComponent } from './proposal-home-view.component';

describe('ProposalHomeViewComponent', () => {
  let component: ProposalHomeViewComponent;
  let fixture: ComponentFixture<ProposalHomeViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProposalHomeViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProposalHomeViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
