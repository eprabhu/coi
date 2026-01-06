import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidationDockComponent } from './validation-dock.component';

describe('ValidationDockComponent', () => {
  let component: ValidationDockComponent;
  let fixture: ComponentFixture<ValidationDockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ValidationDockComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidationDockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
