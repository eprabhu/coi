/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ElasticMessageDeletedComponent } from './elastic-message-deleted.component';

describe('ElasticMessageDeletedComponent', () => {
  let component: ElasticMessageDeletedComponent;
  let fixture: ComponentFixture<ElasticMessageDeletedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ElasticMessageDeletedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ElasticMessageDeletedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
