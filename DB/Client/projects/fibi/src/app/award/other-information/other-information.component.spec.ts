import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherInformationComponent } from './other-information.component';

describe('OtherInformationComponent', () => {
  let component: OtherInformationComponent;
  let fixture: ComponentFixture<OtherInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OtherInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OtherInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
