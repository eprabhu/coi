import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DuplicateMarkingConfirmationComponent } from './duplicate-marking-confirmation.component';

describe('DuplicateMarkingConfirmationComponent', () => {
  let component: DuplicateMarkingConfirmationComponent;
  let fixture: ComponentFixture<DuplicateMarkingConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DuplicateMarkingConfirmationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DuplicateMarkingConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
