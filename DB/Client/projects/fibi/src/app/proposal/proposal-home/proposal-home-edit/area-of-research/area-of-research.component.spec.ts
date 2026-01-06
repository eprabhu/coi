import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AreaOfResearchDetailsComponent } from './area-of-research.component';

describe('AreaOfResearchDetailsComponent', () => {
  let component: AreaOfResearchDetailsComponent;
  let fixture: ComponentFixture<AreaOfResearchDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AreaOfResearchDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AreaOfResearchDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
