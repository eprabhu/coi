import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EndorsementEditComponent } from './endorsement-edit.component';

describe('EndorsementEditComponent', () => {
  let component: EndorsementEditComponent;
  let fixture: ComponentFixture<EndorsementEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EndorsementEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EndorsementEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
