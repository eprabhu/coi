import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatrixFormComponent } from './matrix-form.component';

describe('MatrixFormComponent', () => {
  let component: MatrixFormComponent;
  let fixture: ComponentFixture<MatrixFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MatrixFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatrixFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
