import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityStatusChangeComponent } from './entity-status-change.component';

describe('EntityStatusChangeComponent', () => {
  let component: EntityStatusChangeComponent;
  let fixture: ComponentFixture<EntityStatusChangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntityStatusChangeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntityStatusChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
