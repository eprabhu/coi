import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EndorsementViewComponent } from './endorsement-view.component';

describe('EndorsementViewComponent', () => {
  let component: EndorsementViewComponent;
  let fixture: ComponentFixture<EndorsementViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EndorsementViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EndorsementViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
