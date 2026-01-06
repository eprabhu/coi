import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryTotalComponent } from './category-total.component';

describe('CategoryTotalComponent', () => {
  let component: CategoryTotalComponent;
  let fixture: ComponentFixture<CategoryTotalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CategoryTotalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryTotalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
