import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DuplicateEntityCheckComponent } from './duplicate-entity-check.component';

describe('DuplicateEntityCheckComponent', () => {
  let component: DuplicateEntityCheckComponent;
  let fixture: ComponentFixture<DuplicateEntityCheckComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DuplicateEntityCheckComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DuplicateEntityCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
