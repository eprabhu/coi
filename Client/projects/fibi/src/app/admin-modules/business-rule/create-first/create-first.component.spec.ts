import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateFirstComponent } from './create-first.component';

describe('CreateFirstComponent', () => {
  let component: CreateFirstComponent;
  let fixture: ComponentFixture<CreateFirstComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateFirstComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateFirstComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
