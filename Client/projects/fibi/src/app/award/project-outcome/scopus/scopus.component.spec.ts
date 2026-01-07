import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScopusComponent } from './scopus.component';

describe('ScopusComponent', () => {
  let component: ScopusComponent;
  let fixture: ComponentFixture<ScopusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScopusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScopusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
