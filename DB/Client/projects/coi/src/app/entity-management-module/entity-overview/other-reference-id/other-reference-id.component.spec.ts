import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherReferenceIdComponent } from './other-reference-id.component';

describe('OtherReferenceIdComponent', () => {
  let component: OtherReferenceIdComponent;
  let fixture: ComponentFixture<OtherReferenceIdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtherReferenceIdComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtherReferenceIdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
