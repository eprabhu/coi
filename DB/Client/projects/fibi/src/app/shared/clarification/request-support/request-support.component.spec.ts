import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestSupportComponent } from './request-support.component';

describe('RequestSupportComponent', () => {
  let component: RequestSupportComponent;
  let fixture: ComponentFixture<RequestSupportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequestSupportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestSupportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
