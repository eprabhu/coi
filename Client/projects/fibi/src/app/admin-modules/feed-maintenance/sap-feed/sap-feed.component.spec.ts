import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SapFeedComponent } from './sap-feed.component';

describe('SapFeedComponent', () => {
  let component: SapFeedComponent;
  let fixture: ComponentFixture<SapFeedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SapFeedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SapFeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
