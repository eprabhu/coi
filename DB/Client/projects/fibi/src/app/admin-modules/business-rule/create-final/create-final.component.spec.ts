import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateFinalComponent } from './create-final.component';

describe('CreateFinalComponent', () => {
  let component: CreateFinalComponent;
  let fixture: ComponentFixture<CreateFinalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateFinalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateFinalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
